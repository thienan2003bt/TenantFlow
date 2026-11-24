import type { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import type { Express } from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock, type MockInstance } from "vitest";
import { AppModule } from "../src/app.module.js";
import { RegistrationService } from "../src/auth/registration.service.js";
import {
  configureHttpApplication,
  FRONTEND_ORIGIN,
  httpApplicationOptions,
  LOCAL_LISTENER_HOST,
} from "../src/http/configure-http.js";

const input: { email: string; password: string } = { email: "alice@example.com", password: "Allowed-Reg-7391!" };

describe("Registration request protections (AppModule, persistence/service stubbed)", () => {
  let app: NestExpressApplication;
  let register: Mock<RegistrationService["register"]>;

  beforeEach(async () => {
    register = vi.fn<RegistrationService["register"]>().mockResolvedValue(undefined);
    const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getDataSourceToken())
      .useValue({ manager: {}, isInitialized: false })
      .overrideProvider(RegistrationService)
      .useValue({ register })
      .compile();
    app = module.createNestApplication<NestExpressApplication>(httpApplicationOptions);
    configureHttpApplication(app);
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  it("binds the local listener to IPv4 loopback and disables proxy trust", async () => {
    const express: Express = app.getHttpAdapter().getInstance();
    expect(express.get("trust proxy")).toBe(false);
    await app.listen(0, LOCAL_LISTENER_HOST);
    expect(app.getHttpServer().address()).toMatchObject({ address: "127.0.0.1", family: "IPv4" });
  });

  it("allows a credentialed preflight only for the exact frontend origin", async () => {
    const response: request.Response = await request(app.getHttpServer())
      .options("/auth/register")
      .set("Origin", FRONTEND_ORIGIN)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type")
      .expect(204)
      .expect("Cache-Control", "no-store");
    expect(response.headers["access-control-allow-origin"]).toBe(FRONTEND_ORIGIN);
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(register).not.toHaveBeenCalled();
  });

  it("does not grant CORS access to a foreign origin on safe GET requests", async () => {
    const response: request.Response = await request(app.getHttpServer())
      .get("/")
      .set("Origin", "https://foreign.example")
      .expect(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.headers["access-control-allow-credentials"]).toBeUndefined();
  });

  it.each([
    { label: "neither browser header", headers: {} },
    { label: "same-origin fetch metadata", headers: { "Sec-Fetch-Site": "same-origin" } },
    { label: "user-initiated fetch metadata", headers: { "Sec-Fetch-Site": "none" } },
    { label: "a trusted cross-site frontend", headers: { Origin: FRONTEND_ORIGIN, "Sec-Fetch-Site": "cross-site" } },
    { label: "a trusted same-site frontend", headers: { Origin: FRONTEND_ORIGIN, "Sec-Fetch-Site": "same-site" } },
    {
      label: "matching Origin and Host without fetch metadata",
      headers: { Origin: "http://localhost:14400", Host: "localhost:14400" },
    },
    {
      label: "the documented fetch-metadata precedence",
      headers: { Origin: "https://foreign.example", "Sec-Fetch-Site": "same-origin" },
    },
  ])("preserves Nest CSRF allowance for $label", async ({ headers }) => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .set(headers)
      .send(input)
      .expect(202)
      .expect("Cache-Control", "no-store");
    expect(register).toHaveBeenCalledTimes(1);
  });

  it.each([
    { label: "foreign Origin", headers: { Origin: "https://foreign.example" } },
    { label: "opaque Origin", headers: { Origin: "null" } },
    { label: "a different loopback frontend origin", headers: { Origin: "http://127.0.0.1:3000" } },
    { label: "same-site metadata without a trusted Origin", headers: { "Sec-Fetch-Site": "same-site" } },
    { label: "cross-site metadata without Origin", headers: { "Sec-Fetch-Site": "cross-site" } },
    { label: "unexpected fetch metadata", headers: { "Sec-Fetch-Site": "unexpected" } },
    {
      label: "forged proxy authority",
      headers: { Origin: "https://foreign.example", Host: "localhost:14400", "X-Forwarded-Host": "foreign.example" },
    },
  ])("rejects $label before DTO/service work", async ({ headers }) => {
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .set(headers)
      .send(input)
      .expect(403)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({ statusCode: 403, code: "CSRF_REJECTED", message: "Request origin rejected." });
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(register).not.toHaveBeenCalled();
  });

  it.each(["GET", "HEAD"])("preserves safe %s requests across origins", async (method) => {
    const operation: request.Test =
      method === "HEAD" ? request(app.getHttpServer()).head("/") : request(app.getHttpServer()).get("/");
    const response: request.Response = await operation
      .set("Origin", "https://foreign.example")
      .set("Sec-Fetch-Site", "cross-site")
      .expect(200);
    expect(response.status).toBe(200);
  });

  it.each([
    "text/plain",
    "application/x-www-form-urlencoded",
    "application/problem+json",
    "application/json; charset=iso-8859-1",
  ])("rejects media/charset %s", async (mediaType) => {
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .set("Content-Type", mediaType)
      .send(JSON.stringify(input))
      .expect(415)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "Unsupported request format.",
    });
    expect(register).not.toHaveBeenCalled();
  });

  it.each(["gzip", "br", "deflate", "identity, gzip"])(
    "rejects content encoding %s before decompression",
    async (encoding) => {
      await request(app.getHttpServer())
        .post("/auth/register")
        .set("Content-Type", "application/json")
        .set("Content-Encoding", encoding)
        .send(JSON.stringify(input))
        .expect(415)
        .expect("Cache-Control", "no-store");
      expect(register).not.toHaveBeenCalled();
    },
  );

  it("accepts JSON with an explicit identity encoding and UTF-8 charset", async () => {
    await request(app.getHttpServer())
      .post("/auth/register")
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Content-Encoding", "identity")
      .send(JSON.stringify(input))
      .expect(202);
  });

  it("sanitizes malformed JSON without logging or echoing its password-bearing body", async () => {
    const log: ReturnType<typeof vi.spyOn> = vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    const consoleError: ReturnType<typeof vi.spyOn> = vi.spyOn(console, "error").mockImplementation(() => {});
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .send('{"email":"alice@example.com","password":"sensitive-unterminated')
      .expect(400)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({ statusCode: 400, code: "INVALID_INPUT", message: "Invalid registration input." });
    expect(log).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
  });

  it("accepts exactly 16 KiB and rejects one byte more before validation", async () => {
    const padding: number = 16_384 - Buffer.byteLength(JSON.stringify(input));
    const body: string = JSON.stringify({ ...input, email: " ".repeat(padding) + input.email });
    expect(Buffer.byteLength(body)).toBe(16_384);
    await request(app.getHttpServer())
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .send(body)
      .expect(202);
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .send(body + " ")
      .expect(413)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 413,
      code: "PAYLOAD_TOO_LARGE",
      message: "Request body is too large.",
    });
    expect(register).toHaveBeenCalledTimes(1);
  });

  it("enforces the body limit in bytes for multibyte input", async () => {
    const body: string = JSON.stringify({ ...input, password: "😀".repeat(5_000) });
    expect(body.length).toBeLessThan(16_384);
    expect(Buffer.byteLength(body)).toBeGreaterThan(16_384);
    await request(app.getHttpServer())
      .post("/auth/register")
      .set("Content-Type", "application/json")
      .send(body)
      .expect(413);
    expect(register).not.toHaveBeenCalled();
  });

  it("counts DTO-invalid requests, ignores forged IP headers and covers route case/trailing-slash aliases", async () => {
    for (let attempt: number = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer())
        .post(attempt % 2 === 0 ? "/AUTH/REGISTER/" : "/auth/register")
        .set("X-Forwarded-For", "192.0.2." + attempt)
        .send({})
        .expect(400);
    }
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .set("X-Forwarded-For", "198.51.100.1")
      .set("X-Real-IP", "198.51.100.2")
      .set("Origin", FRONTEND_ORIGIN)
      .send(input)
      .expect(429)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({
      statusCode: 429,
      code: "RATE_LIMITED",
      message: "Too many registration attempts.",
    });
    expect(response.headers["access-control-allow-origin"]).toBe(FRONTEND_ORIGIN);
    expect(response.headers["access-control-expose-headers"].toLowerCase()).toContain("retry-after");
    expect(Number(response.headers["retry-after"])).toBeGreaterThan(0);
    expect(Number(response.headers["retry-after"])).toBeLessThanOrEqual(3600);
    expect(register).not.toHaveBeenCalled();
  });

  it("resets the attempt window at exactly one hour and supplies a rounded Retry-After", async () => {
    const initial: number = Date.now();
    const clock: MockInstance<typeof Date.now> = vi.spyOn(Date, "now").mockReturnValue(initial);
    for (let attempt: number = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer()).post("/auth/register").send({}).expect(400);
    }
    clock.mockReturnValue(initial + 3_599_999);
    await request(app.getHttpServer()).post("/auth/register").send(input).expect(429).expect("Retry-After", "1");
    clock.mockReturnValue(initial + 3_600_000);
    await request(app.getHttpServer()).post("/auth/register").send(input).expect(202);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it.each([
    { label: "CSRF", body: "not JSON", media: "application/json", origin: "https://foreign.example", status: 403 },
    { label: "JSON syntax", body: "{", media: "application/json", origin: FRONTEND_ORIGIN, status: 400 },
    { label: "media type", body: "not JSON", media: "text/plain", origin: FRONTEND_ORIGIN, status: 415 },
    { label: "body size", body: "x".repeat(16_385), media: "application/json", origin: FRONTEND_ORIGIN, status: 413 },
  ])(
    "does not count earlier $label rejections toward the registration limit",
    async ({ body, media, origin, status }) => {
      for (let attempt: number = 0; attempt < 6; attempt += 1) {
        await request(app.getHttpServer())
          .post("/auth/register")
          .set("Content-Type", media)
          .set("Origin", origin)
          .send(body)
          .expect(status);
      }
      await request(app.getHttpServer()).post("/auth/register").send(input).expect(202);
      expect(register).toHaveBeenCalledTimes(1);
    },
  );
});
