import "reflect-metadata";
import { validateEnvironment } from "./env.validation.js";
import { validateDatabaseEnvironment } from "../database/database.validation.js";

const databaseConfig = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  DB_USERNAME: "tenantflow",
  DB_PASSWORD: "test-password-marker",
  DB_NAME: "tenantflow_test",
};

describe("environment validation", () => {
  it("converts ports and includes inherited database validation", () => {
    const config = validateEnvironment({ ...databaseConfig, NODE_ENV: "test", PORT: "14400" });

    expect(config.PORT).toBe(14400);
    expect(config.DB_PORT).toBe(5432);
    expect(() => validateEnvironment({ NODE_ENV: "test", PORT: "14400" })).toThrow(/DB_HOST/);
  });

  it("allows the CLI to validate database settings without HTTP settings", () => {
    expect(validateDatabaseEnvironment(databaseConfig).DB_PORT).toBe(5432);
  });

  it.each([undefined, "", "0", "65536", "5432.5", "invalid"])("rejects invalid database port %s", (DB_PORT) => {
    expect(() => validateDatabaseEnvironment({ ...databaseConfig, DB_PORT })).toThrow(/DB_PORT/);
  });

  it.each(["DB_HOST", "DB_USERNAME", "DB_PASSWORD", "DB_NAME"])("requires nonempty %s", (field) => {
    expect(() => validateDatabaseEnvironment({ ...databaseConfig, [field]: "" })).toThrow(field);
  });

  it("reports configuration errors without leaking the supplied password", () => {
    const validate = () => validateEnvironment({ ...databaseConfig, NODE_ENV: "test", PORT: "invalid" });

    expect(validate).toThrow(/PORT/);
    expect(validate).not.toThrow(/test-password-marker/);
  });
});
