import { plainToInstance } from "class-transformer";
import { IsEnum, IsNumber, Max, Min, validateSync, ValidationError } from "class-validator";
import { Environment } from "@enums/environment.enum.ts";

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
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
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
