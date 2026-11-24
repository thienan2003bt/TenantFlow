import { Catch, HttpStatus, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";
import { AuthInputError } from "../errors/auth-input.error.js";

@Catch()
export class RegistrationExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response: Response = host.switchToHttp().getResponse<Response>();
    const invalidInput: boolean = error instanceof AuthInputError;
    const statusCode: HttpStatus = invalidInput ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;

    // Never serialize or log raw dependency errors: they may contain credentials or query parameters.
    response.setHeader("Cache-Control", "no-store");
    response.status(statusCode).json({
      statusCode,
      code: invalidInput ? "INVALID_INPUT" : "INTERNAL_ERROR",
      message: invalidInput ? "Invalid registration input." : "An unexpected error occurred.",
    });
  }
}
