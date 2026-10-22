import { Environment } from "@enums/environment.enum.ts";
import { plainToInstance, Type } from "class-transformer";
import { IsEnum, IsInt, Max, Min, validateSync, ValidationError } from "class-validator";
import { DatabaseEnvironment } from "../database/database.validation.js";

class EnvironmentVariables extends DatabaseEnvironment {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig: EnvironmentVariables = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors: ValidationError[] = validateSync(validatedConfig, {
    skipMissingProperties: false,
    validationError: { target: false, value: false },
  });
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed: ${errors.map((error) => Object.values(error.constraints || {}).join(", ")).join("; ")}`;
    throw new Error(errorMessage);
  }

  return validatedConfig;
}
