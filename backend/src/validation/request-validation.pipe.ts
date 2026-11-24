import { BadRequestException, HttpStatus, Injectable, ValidationPipe, type ArgumentMetadata } from "@nestjs/common";

const reservedBodyKeys: ReadonlySet<string> = new Set(["prototype", ...Object.getOwnPropertyNames(Object.prototype)]);

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
      // Nest/class-transformer strip reserved keys and skip inherited methods; reject them before transformation.
      if (Reflect.ownKeys(value).some((key) => typeof key === "symbol" || reservedBodyKeys.has(key))) {
        throw this.exceptionFactory([]);
      }
    }
    return super.transform(value, metadata);
  }
}
