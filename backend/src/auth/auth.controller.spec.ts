import { Logger, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types.js";
import { QueryFailedError } from "typeorm";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { AuthController } from "./auth.controller.js";
import { RegistrationService } from "./registration.service.js";

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
      controllers: [AuthController],
      providers: [{ provide: RegistrationService, useValue: { register } }],
    }).compile();
    app = module.createNestApplication();
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
    expect(register).toHaveBeenCalledExactlyOnceWith(input);
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

  it("maps validation or blocklist rejection to a fixed 400 without echoing the error", async () => {
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
