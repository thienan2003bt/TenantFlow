import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import { EntityManager, QueryFailedError } from "typeorm";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { PersistenceUnavailableError } from "../errors/persistence-unavailable.error.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";
import { PasswordCredential } from "./password-credential.entity.js";
import { PasswordService } from "./password.service.js";
import { RegistrationService } from "./registration.service.js";
import { User } from "./user.entity.js";
import { RegisterDto } from "./register.dto.js";

const input: RegisterDto = RegisterDto.fromUnknown({
  email: "  Alice.Smith+register@Example.com  ",
  password: "  Allowed-Reg-7391!  ",
});
const hash: string = "synthetic-encoded-password-hash";
const failureFor: (fields: Record<string, unknown>) => QueryFailedError = (fields: Record<string, unknown>) =>
  new QueryFailedError(
    "INSERT",
    ["sensitive-query-parameter"],
    Object.assign(new Error("Synthetic database failure"), fields),
  );

describe("RegistrationService", () => {
  let module: TestingModule;
  let service: RegistrationService;
  let insert: ReturnType<typeof vi.fn>;
  let transaction: ReturnType<typeof vi.fn>;
  let assertAllowed: ReturnType<typeof vi.fn>;
  let hashPassword: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    insert = vi.fn().mockResolvedValue({});
    const manager: EntityManager = { insert } as unknown as EntityManager;
    transaction = vi.fn(async (work: (manager: EntityManager) => Promise<void>) => work(manager));
    assertAllowed = vi.fn();
    hashPassword = vi.fn().mockResolvedValue(hash);
    module = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PasswordBlocklistService, useValue: { assertAllowed } },
        { provide: PasswordService, useValue: { hash: hashPassword } },
        { provide: getDataSourceToken(), useValue: { transaction } },
      ],
    }).compile();
    service = module.get(RegistrationService);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await module?.close();
  });

  it("uses Nest's actual DataSource token and returns no account or credential details", async () => {
    await expect(service.register(input)).resolves.toBeUndefined();
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledTimes(2);
    const user: Pick<User, "id" | "email" | "emailCanonical"> = insert.mock.calls[0][1];
    expect(insert.mock.calls[0][0]).toBe(User);
    expect(user).toEqual({
      id: expect.stringMatching(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/),
      email: "Alice.Smith+register@Example.com",
      emailCanonical: "alice.smith+register@example.com",
    });
    expect(insert).toHaveBeenNthCalledWith(2, PasswordCredential, { userId: user.id, passwordHash: hash });
    expect(assertAllowed).toHaveBeenCalledExactlyOnceWith(input.password);
    expect(hashPassword).toHaveBeenCalledExactlyOnceWith(input.password);
  });

  it("waits for hashing to finish before opening the transaction", async () => {
    let finishHash!: (value: string) => void;
    hashPassword.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        finishHash = resolve;
      }),
    );
    const registration: Promise<void> = service.register(input);
    expect(assertAllowed).toHaveBeenCalledTimes(1);
    expect(transaction).not.toHaveBeenCalled();
    finishHash(hash);
    await registration;
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects a blocked password before hashing or persistence", async () => {
    const error: AuthInputError = new AuthInputError("Blocked password.");
    assertAllowed.mockImplementationOnce(() => {
      throw error;
    });
    await expect(service.register(input)).rejects.toBe(error);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("propagates a blocklist operational failure before hashing or persistence", async () => {
    const error: Error = new Error("Blocklist unavailable.");
    assertAllowed.mockImplementationOnce(() => {
      throw error;
    });
    await expect(service.register(input)).rejects.toBe(error);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("propagates a hashing failure without opening a transaction", async () => {
    const error: Error = new Error("Hashing unavailable.");
    hashPassword.mockRejectedValueOnce(error);
    await expect(service.register(input)).rejects.toBe(error);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("accepts the specific canonical-email conflict after the transaction rejects", async () => {
    const events: string[] = [];
    const duplicate: QueryFailedError = failureFor({
      code: "23505",
      constraint: "uq_users_email_canonical",
      table: "users",
    });
    insert.mockRejectedValueOnce(duplicate);
    transaction.mockImplementationOnce(async (work: (manager: EntityManager) => Promise<void>) => {
      try {
        await work({ insert } as unknown as EntityManager);
      } catch (error: unknown) {
        events.push("transaction rejected");
        throw error;
      }
    });
    await service.register(input);
    events.push("registration resolved");
    expect(events).toEqual(["transaction rejected", "registration resolved"]);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(assertAllowed).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
  });

  it.each([
    { label: "a different user unique constraint", fields: { code: "23505", constraint: "pk_users", table: "users" } },
    {
      label: "a credential unique constraint",
      fields: { code: "23505", constraint: "pk_password_credentials", table: "password_credentials" },
    },
    {
      label: "the same constraint name on another table",
      fields: { code: "23505", constraint: "uq_users_email_canonical", table: "other_users" },
    },
    {
      label: "a different SQLSTATE",
      fields: { code: "23503", constraint: "uq_users_email_canonical", table: "users" },
    },
    { label: "a missing table field", fields: { code: "23505", constraint: "uq_users_email_canonical" } },
    { label: "missing driver fields", fields: {} },
  ])("does not hide $label", async ({ fields }) => {
    const error: QueryFailedError = failureFor(fields);
    transaction.mockRejectedValueOnce(error);
    await expect(service.register(input)).rejects.toBe(error);
  });

  it("does not classify an ordinary error as a database duplicate", async () => {
    const error: Error = Object.assign(new Error("Unrelated failure"), {
      code: "23505",
      constraint: "uq_users_email_canonical",
      table: "users",
    });
    transaction.mockRejectedValueOnce(error);
    await expect(service.register(input)).rejects.toBe(error);
  });

  it("propagates credential insertion failure out of the transaction callback", async () => {
    const error: QueryFailedError = failureFor({
      code: "23514",
      constraint: "synthetic_credential_failure",
      table: "password_credentials",
    });
    insert.mockResolvedValueOnce({}).mockRejectedValueOnce(error);
    await expect(service.register(input)).rejects.toBe(error);
    expect(insert).toHaveBeenCalledTimes(2);
    // Real rollback is verified by the PostgreSQL suite, not by this stub.
  });

  it.each([
    {
      label: "a raw acquisition error",
      error: Object.assign(new Error("sensitive connection details"), { code: "ECONNREFUSED" }),
    },
    { label: "a query failure", error: failureFor({ code: "08006" }) },
    {
      label: "a pool wrapper",
      error: new Error("pool failed", { cause: Object.assign(new Error("socket failure"), { code: "ECONNRESET" }) }),
    },
  ])("wraps $label with the original cause and does not retry", async ({ error }) => {
    transaction.mockRejectedValueOnce(error);
    const registration: Promise<void> = service.register(input);
    await expect(registration).rejects.toBeInstanceOf(PersistenceUnavailableError);
    await expect(registration).rejects.toHaveProperty("cause", error);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
  });

  it.each(["blocklist", "hashing"])(
    "does not classify a connection-like %s failure as database unavailability",
    async (stage) => {
      const error: Error = Object.assign(new Error("not a persistence failure"), { code: "ECONNREFUSED" });
      if (stage === "blocklist") {
        assertAllowed.mockImplementationOnce(() => {
          throw error;
        });
      } else {
        hashPassword.mockRejectedValueOnce(error);
      }
      await expect(service.register(input)).rejects.toBe(error);
      expect(transaction).not.toHaveBeenCalled();
    },
  );

  it("does not log driver errors, query parameters or password hashes", async () => {
    const log: MockInstance<typeof console.log> = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn: MockInstance<typeof console.warn> = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorLog: MockInstance<typeof console.error> = vi.spyOn(console, "error").mockImplementation(() => {});
    const error: QueryFailedError = failureFor({ code: "08006" });
    transaction.mockRejectedValueOnce(error);
    await expect(service.register(input)).rejects.toMatchObject({ name: "PersistenceUnavailableError", cause: error });
    expect(log).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(errorLog).not.toHaveBeenCalled();
  });
});
