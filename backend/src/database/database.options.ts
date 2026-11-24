import type { DataSourceOptions } from "typeorm";
import { PasswordCredential } from "../auth/password-credential.entity.js";
import { Session } from "../auth/session.entity.js";
import { User } from "../auth/user.entity.js";
import type { DatabaseEnvironment } from "./database.validation.js";
import { InitialAuth1795512053650 } from "./migrations/1795512053650-InitialAuth.js";

export function createDatabaseOptions(config: DatabaseEnvironment): DataSourceOptions {
  return {
    type: "postgres",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    entities: [User, PasswordCredential, Session],
    migrations: [InitialAuth1795512053650],
    // Schema changes are applied through reviewed migrations, not application startup.
    synchronize: false,
    migrationsRun: false,
  };
}
