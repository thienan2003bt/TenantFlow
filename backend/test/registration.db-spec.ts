import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types.js";
import { AuthController } from "../src/auth/auth.controller.js";
import { RegistrationExceptionFilter } from "../src/auth/registration-exception.filter.js";
import { ValidationModule } from "../src/validation/validation.module.js";
import { setTimeout as delay } from "node:timers/promises";
import { DataSource, type DataSourceOptions, type QueryRunner } from "typeorm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { RegistrationService } from "../src/auth/registration.service.js";
import { RegisterDto } from "../src/auth/register.dto.js";
import { PasswordService } from "../src/auth/password.service.js";
import { PasswordBlocklistService } from "../src/auth/password-blocklist.service.js";
import { PasswordCredential } from "../src/auth/password-credential.entity.js";
import { Session } from "../src/auth/session.entity.js";
import { User } from "../src/auth/user.entity.js";
import { createDatabaseOptions } from "../src/database/database.options.js";

const env: NodeJS.ProcessEnv = process.env;
if (
  !/^tenantflow-registration-db-[a-f0-9-]{36}$/.test(env.TENANTFLOW_TEST_DB_OWNER || "") ||
  env.TENANTFLOW_TEST_DB_HOST !== "127.0.0.1" ||
  env.TENANTFLOW_TEST_DB_USERNAME !== "registration_test" ||
  env.TENANTFLOW_TEST_DB_NAME !== "tenantflow_registration_test" ||
  !env.TENANTFLOW_TEST_DB_PASSWORD ||
  !/^\d+$/.test(env.TENANTFLOW_TEST_DB_PORT || "")
) {
  throw new Error("Run this suite through npm run test:db against its disposable container only.");
}
const options: DataSourceOptions = {
  ...createDatabaseOptions({
    DB_HOST: env.TENANTFLOW_TEST_DB_HOST,
    DB_PORT: Number(env.TENANTFLOW_TEST_DB_PORT),
    DB_USERNAME: env.TENANTFLOW_TEST_DB_USERNAME!,
    DB_PASSWORD: env.TENANTFLOW_TEST_DB_PASSWORD,
    DB_NAME: env.TENANTFLOW_TEST_DB_NAME,
  }),
  extra: { max: 8, connectionTimeoutMillis: 5000, statement_timeout: 15000, lock_timeout: 15000 },
};
const password: string = "  Allowed-Reg-7391!  ";
const input: RegisterDto = RegisterDto.fromUnknown({ email: " Alice.Smith+register@Example.com ", password });

describe("RegistrationService with isolated PostgreSQL", () => {
  let dataSource: DataSource;
  let service: RegistrationService;
  const passwords: PasswordService = new PasswordService();
  let migrationReport: { pendingBefore: boolean; pendingAfter: boolean; revertedTables: string[] };

  beforeAll(async () => {
    dataSource = new DataSource(options);
    await dataSource.initialize();
    const pendingBefore: boolean = await dataSource.showMigrations();
    await dataSource.runMigrations();
    const pendingAfter: boolean = await dataSource.showMigrations();
    await dataSource.undoLastMigration();
    const rows: { tablename: string }[] = await dataSource.query<{ tablename: string }[]>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    );
    await dataSource.runMigrations();
    migrationReport = { pendingBefore, pendingAfter, revertedTables: rows.map((row) => row.tablename) };
    service = new RegistrationService(new PasswordBlocklistService(), passwords, dataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "sessions", "password_credentials", "users"');
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  async function credentialFor(userId: string): Promise<PasswordCredential> {
    return dataSource
      .getRepository(PasswordCredential)
      .createQueryBuilder("credential")
      .addSelect("credential.passwordHash")
      .where("credential.userId = :userId", { userId })
      .getOneOrFail();
  }

  it("applies, reverts and reapplies the actual migration without synchronization", async () => {
    expect(migrationReport).toEqual({ pendingBefore: true, pendingAfter: false, revertedTables: ["migrations"] });
    expect(await dataSource.showMigrations()).toBe(false);
    expect(dataSource.options.synchronize).toBe(false);
    const version: { server_version_num: string }[] =
      await dataSource.query<{ server_version_num: string }[]>("SHOW server_version_num");
    expect(Number(version[0].server_version_num)).toBeGreaterThanOrEqual(170000);
    expect(Number(version[0].server_version_num)).toBeLessThan(180000);
  });

  it("creates one pending account and a real verifiable hash without creating a session", async () => {
    await expect(service.register(input)).resolves.toBeUndefined();
    const user: User = await dataSource
      .getRepository(User)
      .findOneByOrFail({ emailCanonical: "alice.smith+register@example.com" });
    expect(user.email).toBe("Alice.Smith+register@Example.com");
    expect(user.status).toBe("pending_verification");
    expect(user.emailVerifiedAt).toBeNull();
    expect(user.deletedAt).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
    const credential: PasswordCredential = await credentialFor(user.id);
    expect(credential.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await passwords.verify(password, credential.passwordHash)).toBe(true);
    expect(await passwords.verify(password.trim(), credential.passwordHash)).toBe(false);
    expect(
      (await dataSource.getRepository(PasswordCredential).findOneByOrFail({ userId: user.id })).passwordHash,
    ).toBeUndefined();
    expect(await dataSource.getRepository(User).count()).toBe(1);
    expect(await dataSource.getRepository(PasswordCredential).count()).toBe(1);
    expect(await dataSource.getRepository(Session).count()).toBe(0);
  });

  it.each(["pending_verification", "active", "inactive", "frozen", "deleted"])(
    "preserves an existing %s account and credential on duplicate registration",
    async (status) => {
      await service.register(input);
      const user: User = await dataSource
        .getRepository(User)
        .findOneByOrFail({ emailCanonical: "alice.smith+register@example.com" });
      const original: PasswordCredential = await credentialFor(user.id);
      await dataSource.query(
        "UPDATE users SET status = $1::varchar, email_verified_at = CASE WHEN $1::varchar = 'active' THEN CURRENT_TIMESTAMP ELSE NULL END, deleted_at = CASE WHEN $1::varchar = 'deleted' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = $2",
        [status, user.id],
      );
      await expect(
        service.register(
          RegisterDto.fromUnknown({ email: input.email.toLowerCase(), password: "Different-Allowed-8329!" }),
        ),
      ).resolves.toBeUndefined();
      expect(await dataSource.getRepository(User).count()).toBe(1);
      expect(await dataSource.getRepository(PasswordCredential).count()).toBe(1);
      expect((await credentialFor(user.id)).passwordHash).toBe(original.passwordHash);
      expect((await dataSource.getRepository(User).findOneByOrFail({ id: user.id })).status).toBe(status);
      expect(await dataSource.getRepository(Session).count()).toBe(0);
    },
  );

  it("rolls back the user when credential insertion fails inside the actual transaction", async () => {
    await dataSource.query(`CREATE FUNCTION registration_test_reject() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.user_id) THEN
          RAISE EXCEPTION 'Expected user insert before credential insert';
        END IF;
        RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'registration_test_credential_failure', MESSAGE = 'Synthetic credential failure';
      END; $$`);
    await dataSource.query(
      "CREATE TRIGGER registration_test_reject BEFORE INSERT ON password_credentials FOR EACH ROW EXECUTE FUNCTION registration_test_reject()",
    );
    try {
      await expect(service.register(input)).rejects.toMatchObject({
        driverError: { code: "23514", constraint: "registration_test_credential_failure" },
      });
      expect(await dataSource.getRepository(User).count()).toBe(0);
      expect(await dataSource.getRepository(PasswordCredential).count()).toBe(0);
      expect(await dataSource.getRepository(Session).count()).toBe(0);
    } finally {
      await dataSource.query("DROP TRIGGER IF EXISTS registration_test_reject ON password_credentials");
      await dataSource.query("DROP FUNCTION IF EXISTS registration_test_reject()");
    }
  });

  it("returns a safe HTTP 503 and rolls back a server-reported connection failure", async () => {
    let app: INestApplication<App> | undefined;
    // This is a synthetic server SQLSTATE, not a simulated network disconnect.
    await dataSource.query(`CREATE FUNCTION registration_test_unavailable() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        RAISE EXCEPTION USING ERRCODE = '08006', MESSAGE = 'Synthetic connection failure with sensitive details';
      END; $$`);
    try {
      await dataSource.query(
        "CREATE TRIGGER registration_test_unavailable BEFORE INSERT ON password_credentials FOR EACH ROW EXECUTE FUNCTION registration_test_unavailable()",
      );
      const module: TestingModule = await Test.createTestingModule({
        imports: [ValidationModule],
        controllers: [AuthController],
        providers: [RegistrationExceptionFilter, { provide: RegistrationService, useValue: service }],
      }).compile();
      app = module.createNestApplication();
      await app.init();
      const response: request.Response = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: input.email, password })
        .expect(503)
        .expect("Cache-Control", "no-store");
      expect(response.body).toEqual({
        statusCode: 503,
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable.",
      });
      expect(response.headers["set-cookie"]).toBeUndefined();
      expect(await dataSource.getRepository(User).count()).toBe(0);
      expect(await dataSource.getRepository(PasswordCredential).count()).toBe(0);
      expect(await dataSource.getRepository(Session).count()).toBe(0);
    } finally {
      await app?.close();
      await dataSource.query("DROP TRIGGER IF EXISTS registration_test_unavailable ON password_credentials");
      await dataSource.query("DROP FUNCTION IF EXISTS registration_test_unavailable()");
    }
  });

  it("handles truly overlapping canonical-email inserts without replacing the winning password", async () => {
    const blocker: QueryRunner = dataSource.createQueryRunner();
    await blocker.connect();
    const pending: Promise<{ status: string; reason?: unknown }>[] = [];
    const track: (work: Promise<void>) => Promise<{ status: string; reason?: unknown }> = (work: Promise<void>) =>
      work.then(
        () => ({ status: "fulfilled" }),
        (reason: unknown) => ({ status: "rejected", reason }),
      );
    const waitForLock: (event: string) => Promise<void> = async (event: string) => {
      const deadline: number = Date.now() + 5000;
      while (Date.now() < deadline) {
        const rows: { waiting: boolean }[] = await dataSource.query<{ waiting: boolean }[]>(
          "SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock' AND wait_event = $1) AS waiting",
          [event],
        );
        if (rows[0].waiting) {
          return;
        }
        await delay(20);
      }
      throw new Error(`Expected concurrent database wait: ${event}`);
    };
    try {
      await blocker.query("SELECT pg_advisory_lock(739124)");
      await dataSource.query(`CREATE FUNCTION registration_test_wait() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN PERFORM pg_advisory_xact_lock(739124); RETURN NEW; END; $$`);
      await dataSource.query(
        "CREATE TRIGGER registration_test_wait BEFORE INSERT ON password_credentials FOR EACH ROW EXECUTE FUNCTION registration_test_wait()",
      );
      pending.push(track(service.register(input)));
      await waitForLock("advisory");
      pending.push(
        track(
          service.register(
            RegisterDto.fromUnknown({ email: input.email.toLowerCase(), password: "Different-Allowed-8329!" }),
          ),
        ),
      );
      await waitForLock("transactionid");
      await blocker.query("SELECT pg_advisory_unlock(739124)");
      expect((await Promise.all(pending)).map((result) => result.status)).toEqual(["fulfilled", "fulfilled"]);
      expect(await dataSource.getRepository(User).count()).toBe(1);
      expect(await dataSource.getRepository(PasswordCredential).count()).toBe(1);
      expect(await dataSource.getRepository(Session).count()).toBe(0);
      const user: User = await dataSource
        .getRepository(User)
        .findOneByOrFail({ emailCanonical: "alice.smith+register@example.com" });
      const credential: PasswordCredential = await credentialFor(user.id);
      expect(await passwords.verify(password, credential.passwordHash)).toBe(true);
      expect(await passwords.verify("Different-Allowed-8329!", credential.passwordHash)).toBe(false);
    } finally {
      await blocker.query("SELECT pg_advisory_unlock(739124)");
      await Promise.all(pending);
      await dataSource.query("DROP TRIGGER IF EXISTS registration_test_wait ON password_credentials");
      await dataSource.query("DROP FUNCTION IF EXISTS registration_test_wait()");
      await blocker.release();
    }
  });

  it("propagates unavailable persistence without creating an account", async () => {
    const closed: DataSource = new DataSource(options);
    await closed.initialize();
    await closed.destroy();
    const unavailable: RegistrationService = new RegistrationService(new PasswordBlocklistService(), passwords, closed);
    await expect(unavailable.register(input)).rejects.toBeInstanceOf(Error);
    expect(await dataSource.getRepository(User).count()).toBe(0);
  });
});
