import type { DataSourceOptions } from "typeorm";
import type { DatabaseEnvironment } from "./database.validation.js";

export function createDatabaseOptions(config: DatabaseEnvironment): DataSourceOptions {
  return {
    type: "postgres",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [],
    migrations: [],
    // Schema changes are applied through reviewed migrations, not application startup.
    synchronize: false,
    migrationsRun: false,
  };
}
