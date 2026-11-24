import { Catch, HttpException, HttpStatus, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class RequestExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const request: Request = host.switchToHttp().getRequest<Request>();
    const response: Response = host.switchToHttp().getResponse<Response>();
    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = "INTERNAL_ERROR";
    let message: string = "An unexpected error occurred.";
    let status: number | undefined;

    if (error instanceof HttpException) {
      status = error.getStatus();
    } else if (error instanceof Error && "type" in error) {
      if (error.type === "entity.too.large") {
        status = HttpStatus.PAYLOAD_TOO_LARGE;
      } else if (error.type === "encoding.unsupported" || error.type === "charset.unsupported") {
        status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
      } else if (
        error.type === "entity.parse.failed" ||
        error.type === "request.aborted" ||
        error.type === "request.size.invalid"
      ) {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    if (status === HttpStatus.BAD_REQUEST) {
      statusCode = status;
      code = "INVALID_INPUT";
      message = /^\/auth\/register\/?$/i.test(request.path) ? "Invalid registration input." : "Invalid request input.";
    } else if (status === HttpStatus.FORBIDDEN) {
      // Built-in CSRF is the only source of early 403 responses in this slice.
      statusCode = status;
      code = "CSRF_REJECTED";
      message = "Request origin rejected.";
    } else if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
      statusCode = status;
      code = "PAYLOAD_TOO_LARGE";
      message = "Request body is too large.";
    } else if (status === HttpStatus.UNSUPPORTED_MEDIA_TYPE) {
      statusCode = status;
      code = "UNSUPPORTED_MEDIA_TYPE";
      message = "Unsupported request format.";
    } else if (status === HttpStatus.NOT_FOUND) {
      statusCode = status;
      code = "NOT_FOUND";
      message = "Resource not found.";
    }

    // Parser errors can retain the raw body; never log or serialize them.
    response.setHeader("Cache-Control", "no-store");
    response.status(statusCode).json({ statusCode, code, message });
  }
}
