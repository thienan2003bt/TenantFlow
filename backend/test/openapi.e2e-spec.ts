import { Environment } from "@enums/environment.enum.ts";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test, type TestingModule } from "@nestjs/testing";
import { getDataSourceToken } from "@nestjs/typeorm";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { AppModule } from "../src/app.module.js";
import { parseAuthInput } from "../src/auth/auth-input.js";
import { RegistrationService } from "../src/auth/registration.service.js";
import { configureHttpApplication, httpApplicationOptions } from "../src/http/configure-http.js";
import { configureOpenApi } from "../src/http/configure-openapi.js";

describe("OpenAPI (AppModule, persistence/service stubbed)", () => {
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
  });

  afterEach(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  it("serves the development UI, bundled scripts and JSON without an external validator", async () => {
    configureOpenApi(app, Environment.DEVELOPMENT);
    await app.init();
    await request(app.getHttpServer())
      .get("/docs/")
      .expect(200)
      .expect(/swagger-ui/);
    await request(app.getHttpServer()).get("/docs/swagger-ui-bundle.js").expect(200);
    const initializer: request.Response = await request(app.getHttpServer())
      .get("/docs/swagger-ui-init.js")
      .expect(200);
    expect(initializer.text).toMatch(/"validatorUrl": null/);
    expect(initializer.text).toMatch(/"persistAuthorization": false/);
    await request(app.getHttpServer()).get("/docs-yaml").expect(404);
    expect(register).not.toHaveBeenCalled();
  });

  it("describes only implemented routes, the custom input contract and safe responses", async () => {
    configureOpenApi(app, Environment.DEVELOPMENT);
    await app.init();
    const response: request.Response = await request(app.getHttpServer()).get("/docs-json").expect(200);
    const document: request.Response["body"] = response.body;
    expect(Object.keys(document.paths).sort()).toEqual(["/", "/auth/register", "/health-check"]);
    const schema: request.Response["body"] = document.components.schemas.RegisterDto;
    expect(schema.required.sort()).toEqual(["email", "password"]);
    expect(schema.additionalProperties).toBe(false);
    expect(schema.properties.password).toMatchObject({
      type: "string",
      format: "password",
      minLength: 8,
      maxLength: 128,
    });
    expect(() =>
      parseAuthInput({ email: schema.properties.email.example, password: schema.properties.password.example }),
    ).not.toThrow();
    const operation: request.Response["body"] = document.paths["/auth/register"].post;
    expect(operation.requestBody.content["application/json"].schema).toEqual({
      $ref: "#/components/schemas/RegisterDto",
    });
    expect(Object.keys(operation.responses).sort()).toEqual(["202", "400", "403", "413", "415", "429", "500", "503"]);
    for (const [status, code] of [
      [400, "INVALID_INPUT"],
      [403, "CSRF_REJECTED"],
      [413, "PAYLOAD_TOO_LARGE"],
      [415, "UNSUPPORTED_MEDIA_TYPE"],
      [429, "RATE_LIMITED"],
      [500, "INTERNAL_ERROR"],
      [503, "SERVICE_UNAVAILABLE"],
    ] as const) {
      expect(operation.responses[status].content["application/json"].example).toMatchObject({
        statusCode: status,
        code,
      });
      expect(operation.responses[status].headers["Cache-Control"].schema.enum).toEqual(["no-store"]);
    }
    expect(operation.responses[429].headers["Retry-After"].schema).toMatchObject({ type: "integer", minimum: 1 });
    expect(operation.responses[202].content["application/json"].schema.$ref).toBe(
      "#/components/schemas/RegistrationAcceptedResponse",
    );
    expect(document.paths["/health-check"].get.responses[200].content["text/plain"].schema.type).toBe("string");
    expect(document.components.schemas).not.toHaveProperty("User");
    expect(register).not.toHaveBeenCalled();
  });

  it("accepts the Swagger example from the API origin through the normal validation and guard pipeline", async () => {
    configureOpenApi(app, Environment.DEVELOPMENT);
    await app.init();
    const document: request.Response = await request(app.getHttpServer()).get("/docs-json").expect(200);
    const properties: request.Response["body"] = document.body.components.schemas.RegisterDto.properties;
    const input: { email: string; password: string } = {
      email: properties.email.example,
      password: properties.password.example,
    };
    const response: request.Response = await request(app.getHttpServer())
      .post("/auth/register")
      .set("Host", "localhost:14400")
      .set("Origin", "http://localhost:14400")
      .set("Sec-Fetch-Site", "same-origin")
      .send(input)
      .expect(202)
      .expect("Cache-Control", "no-store");
    expect(response.body).toEqual({ message: "Registration request accepted." });
    expect(response.headers["set-cookie"]).toBeUndefined();
    expect(register).toHaveBeenCalledWith(input);
    await request(app.getHttpServer())
      .post("/auth/register")
      .set("Origin", "https://foreign.example")
      .send(input)
      .expect(403);
    expect(register).toHaveBeenCalledTimes(1);
    for (let attempt: number = 0; attempt < 4; attempt += 1) {
      await request(app.getHttpServer())
        .post("/auth/register")
        .set("Sec-Fetch-Site", "same-origin")
        .send(input)
        .expect(202);
    }
    await request(app.getHttpServer())
      .post("/auth/register")
      .set("Sec-Fetch-Site", "same-origin")
      .send(input)
      .expect(429);
    expect(register).toHaveBeenCalledTimes(5);
  });

  it.each([Environment.PRODUCTION, Environment.TEST, Environment.PROVISIONING])(
    "does not expose UI, schema or assets in %s",
    async (environment: Environment) => {
      configureOpenApi(app, environment);
      await app.init();
      for (const path of [
        "/docs",
        "/docs/",
        "/docs-json",
        "/docs-yaml",
        "/docs/swagger-ui-init.js",
        "/docs/swagger-ui-bundle.js",
      ]) {
        await request(app.getHttpServer()).get(path).expect(404);
      }
      await request(app.getHttpServer()).get("/health-check").expect(200);
      expect(register).not.toHaveBeenCalled();
    },
  );
});
