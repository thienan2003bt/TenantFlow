import { Body, Controller, Get, HttpCode, Post, type INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { IsString } from "class-validator";
import request from "supertest";
import type { App } from "supertest/types.js";
import { afterEach, beforeEach, describe, it } from "vitest";
import { ValidationModule } from "./validation.module.js";

class ExampleDto {
  @IsString()
  readonly title!: string;
}

@Controller("validation-example")
class ExampleController {
  @Post()
  @HttpCode(200)
  create(@Body() input: ExampleDto): { title: string; transformed: boolean } {
    return { title: input.title, transformed: input instanceof ExampleDto };
  }

  @Get()
  read(): string {
    return "unchanged";
  }
}

describe("ValidationModule (global HTTP validation)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ValidationModule],
      controllers: [ExampleController],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it("validates and transforms another DTO with plain @Body() and no route-specific pipe", async () => {
    await request(app.getHttpServer())
      .post("/validation-example")
      .send({ title: "Example" })
      .expect(200)
      .expect({ title: "Example", transformed: true });
  });

  it.each([
    { label: "missing properties", body: {} },
    { label: "wrong types", body: { title: 123 } },
    { label: "extra properties", body: { title: "Example", admin: true } },
    { label: "arrays", body: [{ title: "Example" }] },
  ])("rejects $label with a fixed safe error for a different DTO", async ({ body }) => {
    await request(app.getHttpServer())
      .post("/validation-example")
      .send(body)
      .expect(400)
      .expect({ statusCode: 400, code: "INVALID_INPUT", message: "Invalid request input." });
  });

  it("preserves handlers without a DTO parameter", async () => {
    await request(app.getHttpServer()).get("/validation-example").expect(200).expect("unchanged");
  });
});
