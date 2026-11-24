import { BadRequestException, HttpStatus, Injectable, ValidationPipe, type ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class RequestValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transformOptions: { enableImplicitConversion: false },
      validationError: { target: false, value: false },
      exceptionFactory: () =>
        new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: "INVALID_INPUT",
          message: "Invalid request input.",
        }),
    });
  }

  override async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (metadata.type === "body" && this.toValidate(metadata)) {
      if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw this.exceptionFactory([]);
      }
      // Nest strips these keys before validation; our body contract rejects them instead.
      const reservedKeys: readonly string[] = ["__proto__", "prototype", "constructor"];
      if (Reflect.ownKeys(value).some((key) => typeof key === "symbol" || reservedKeys.includes(key))) {
        throw this.exceptionFactory([]);
      }
    }
    return super.transform(value, metadata);
  }
}
