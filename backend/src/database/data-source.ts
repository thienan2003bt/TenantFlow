import "reflect-metadata";
import { DataSource } from "typeorm";
import { createDatabaseOptions } from "./database.options.js";
import { validateDatabaseEnvironment } from "./database.validation.js";

// The CLI loads environment variables before importing this file and owns initialization.
export default new DataSource(createDatabaseOptions(validateDatabaseEnvironment(process.env)));
