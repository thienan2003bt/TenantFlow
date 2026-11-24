import type { NestExpressApplication } from "@nestjs/platform-express";
import { configureHttpApplication, httpApplicationOptions } from "../http/configure-http.js";
import { Logger, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types.js";
import { QueryFailedError } from "typeorm";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { PersistenceUnavailableError } from "../errors/persistence-unavailable.error.js";
import { AuthController } from "./auth.controller.js";
import { RegistrationService } from "./registration.service.js";
import { RegisterDto } from "./register.dto.js";
import { ValidationModule } from "../validation/validation.module.js";
import { AuthEmailConstraint } from "./auth-input.constraints.js";
import { RegistrationExceptionFilter } from "./registration-exception.filter.js";

const input: { email: string; password: string } = {
  email: "  Alice+registration@Example.com  ",
  password: "Allowed-Reg-7391!",
};

describe("AuthController (HTTP, registration service stubbed)", () => {
  let app: INestApplication<App>;
  let register: Mock<RegistrationService["register"]>;

  beforeEach(async () => {
    register = vi.fn<RegistrationService["register"]>().mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({
      imports: [ValidationModule],
      controllers: [AuthController],
      providers: [RegistrationExceptionFilter, { provide: RegistrationService, useValue: { register } }],
    }).compile();
    const application: NestExpressApplication =
      module.createNestApplication<NestExpressApplication>(httpApplicationOptions);
    configureHttpApplication(application);
    app = application;
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  it("returns the fixed accepted response without account details or a session cookie", async () => {
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(input)
      .expect(202)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({ message: "Registration request accepted." });
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(register).toHaveBeenCalledExactlyOnceWith(RegisterDto.fromUnknown(input));
    expect(register.mock.calls[0][0]).toBeInstanceOf(RegisterDto);
  });

  it("awaits registration before returning an accepted response", async () => {
    let finishRegistration!: () => void;
    let notifyStarted!: () => void;
    const started: Promise<void> = new Promise<void>((resolve) => {
      notifyStarted = resolve;
    });
    register.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishRegistration = resolve;
          notifyStarted();
        }),
    );
    let completed: boolean = false;
    const response: Promise<request.Response> = request(app.getHttpServer())
      .post("/auth/register")
      .send(input)
      .then((result: request.Response) => {
        completed = true;
        return result;
      });
    await started;
    expect(completed).toBe(false);
    finishRegistration();
    expect((await response).status).toBe(202);
  });

  it("maps blocklist rejection to a fixed 400 without echoing the error", async () => {
    register.mockRejectedValueOnce(new AuthInputError("sensitive-input-details"));
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(input)
      .expect(400)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 400,
      code: "INVALID_INPUT",
      message: "Invalid registration input.",
    });
    expect(response.text).not.toContain("sensitive-input-details");
  });

  it.each([
    { label: "missing fields", body: {} },
    { label: "an invalid email", body: { ...input, email: "invalid" } },
    { label: "an invalid password", body: { ...input, password: "weak" } },
    { label: "a client-supplied canonical email", body: { ...input, emailCanonical: "forged@example.com" } },
    { label: "an array", body: [input] },
    ...["__proto__", "constructor", "prototype", "toString", "hasOwnProperty"].map((key) => ({
      label: `a reserved ${key} field`,
      body: { ...input, [key]: "untrusted" },
    })),
  ])("rejects $label in the pipe before invoking registration", async ({ body }) => {
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(body)
      .expect(400)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({ statusCode: 400, code: "INVALID_INPUT", message: "Invalid registration input." });
    expect(register).not.toHaveBeenCalled();
  });

  it("sanitizes an unexpected pipe failure before the controller method executes", async () => {
    const logError: ReturnType<typeof vi.spyOn> = vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    vi.spyOn(AuthEmailConstraint.prototype, "validate").mockImplementationOnce(() => {
      throw new Error("sensitive-pipe-details");
    });
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(input)
      .expect(500)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 500,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    });
    expect(register).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it("returns a fixed 503 for the persistence marker without exposing its message or cause", async () => {
    const logError: ReturnType<typeof vi.spyOn> = vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    const consoleError: ReturnType<typeof vi.spyOn> = vi.spyOn(console, "error").mockImplementation(() => {});
    const cause: QueryFailedError = new QueryFailedError(
      "sensitive query",
      ["sensitive-password-hash"],
      new Error("sensitive driver details"),
    );
    const failure: PersistenceUnavailableError = new PersistenceUnavailableError(
      "sensitive custom error message",
      cause,
    );
    expect(failure.getCause()).toBe(cause);
    register.mockRejectedValueOnce(failure);
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(input)
      .expect(503)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 503,
      code: "SERVICE_UNAVAILABLE",
      message: "Service temporarily unavailable.",
    });
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(logError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it.each([
    {
      label: "an unclassified connection-like error",
      failure: Object.assign(new Error("sensitive connection details"), { code: "ECONNREFUSED" }),
    },
    {
      label: "a spoofed persistence marker name",
      failure: Object.assign(new Error("sensitive details"), { name: "PersistenceUnavailableError" }),
    },
    {
      label: "a database error containing query parameters",
      failure: new QueryFailedError("INSERT INTO users", ["sensitive-password-hash"], new Error("database details")),
    },
    { label: "a non-Error string rejection", failure: "sensitive-rejection" },
    { label: "a non-Error object rejection", failure: { password: "sensitive-password" } },
  ])("maps $label to a safe 500 without logging the raw failure", async ({ failure }) => {
    const logError: ReturnType<typeof vi.spyOn> = vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    const consoleError: ReturnType<typeof vi.spyOn> = vi.spyOn(console, "error").mockImplementation(() => {});
    register.mockRejectedValueOnce(failure);
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .send(input)
      .expect(500)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 500,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    });
    expect(logError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
