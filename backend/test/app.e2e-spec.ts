import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types.js";
import { getDataSourceToken } from "@nestjs/typeorm";
import { AppModule } from "./../src/app.module.js";

describe("AppController (HTTP smoke, database stubbed)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // This suite checks HTTP assembly only. Real PostgreSQL integration is a separate check.
      .overrideProvider(getDataSourceToken())
      .useValue({ manager: {}, isInitialized: false })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!");
  });

  afterEach(async () => {
    await app?.close();
  });
});
