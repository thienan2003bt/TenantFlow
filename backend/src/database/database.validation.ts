import { plainToInstance, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Max, Min, validateSync } from "class-validator";

export class DatabaseEnvironment {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;
}

export function validateDatabaseEnvironment(config: Record<string, unknown>): DatabaseEnvironment {
  const validatedConfig: DatabaseEnvironment = plainToInstance(DatabaseEnvironment, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    validationError: { target: false, value: false },
  });
  if (errors.length > 0) {
    const errorMessage = `Database environment validation failed: ${errors.map((error) => Object.values(error.constraints || {}).join(", ")).join("; ")}`;
    throw new Error(errorMessage);
  }

  return validatedConfig;
}
