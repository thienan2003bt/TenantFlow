import { BadRequestException, Catch, HttpStatus, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { AuthInputError } from "../errors/auth-input.error.js";
import { PersistenceUnavailableError } from "../errors/persistence-unavailable.error.js";

@Catch()
export class RegistrationExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response: Response = host.switchToHttp().getResponse<Response>();
    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = "INTERNAL_ERROR";
    let message: string = "An unexpected error occurred.";

    if (error instanceof AuthInputError || error instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      code = "INVALID_INPUT";
      message = "Invalid registration input.";
    } else if (error instanceof PersistenceUnavailableError) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      code = "SERVICE_UNAVAILABLE";
      message = "Service temporarily unavailable.";
    }

    // Never serialize or log raw dependency errors: they may contain credentials or query parameters.
    response.setHeader("Cache-Control", "no-store");
    response.status(statusCode).json({ statusCode, code, message });
  }
}
