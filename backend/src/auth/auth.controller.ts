import { Body, Controller, Header, HttpCode, HttpStatus, Inject, Post, UseFilters, UseGuards } from "@nestjs/common";
import {
  ApiAcceptedResponse,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
  type HeaderObject,
} from "@nestjs/swagger";
import { RegistrationAcceptedResponse, RegistrationErrorResponse } from "./registration-response.dto.js";
import { RegisterDto } from "./register.dto.js";
import { RegistrationExceptionFilter } from "./registration-exception.filter.js";
import { RegistrationService } from "./registration.service.js";
import { RegistrationRateLimitGuard } from "./registration-rate-limit.guard.js";

const responseHeaders: Record<string, HeaderObject> = {
  "Cache-Control": { schema: { type: "string", enum: ["no-store"] } },
};

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(@Inject(RegistrationService) private readonly registrationService: RegistrationService) {}

  @ApiOperation({
    summary: "Request local account registration",
    description:
      "Creates a pending account atomically. New and duplicate canonical emails receive the same response; duplicates preserve credentials. No session or email is issued. Only email and password fields are accepted.",
  })
  @ApiConsumes("application/json")
  @ApiProduces("application/json")
  @ApiAcceptedResponse({
    description: "Registration accepted, including an existing canonical email.",
    type: RegistrationAcceptedResponse,
    headers: responseHeaders,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input or malformed JSON.",
    type: RegistrationErrorResponse,
    example: { statusCode: 400, code: "INVALID_INPUT", message: "Invalid registration input." },
    headers: responseHeaders,
  })
  @ApiResponse({
    status: 403,
    description: "Request origin rejected by CSRF protection.",
    type: RegistrationErrorResponse,
    example: { statusCode: 403, code: "CSRF_REJECTED", message: "Request origin rejected." },
    headers: responseHeaders,
  })
  @ApiResponse({
    status: 413,
    description: "Request body exceeds 16 KiB.",
    type: RegistrationErrorResponse,
    example: { statusCode: 413, code: "PAYLOAD_TOO_LARGE", message: "Request body is too large." },
    headers: responseHeaders,
  })
  @ApiResponse({
    status: 415,
    description: "Only JSON with identity encoding and a supported charset is accepted.",
    type: RegistrationErrorResponse,
    example: { statusCode: 415, code: "UNSUPPORTED_MEDIA_TYPE", message: "Unsupported request format." },
    headers: responseHeaders,
  })
  @ApiResponse({
    status: 429,
    description: "Five admitted requests per IP per hour; DTO-invalid requests also count.",
    type: RegistrationErrorResponse,
    example: { statusCode: 429, code: "RATE_LIMITED", message: "Too many registration attempts." },
    headers: {
      ...responseHeaders,
      "Retry-After": {
        description: "Seconds until another attempt is allowed.",
        schema: { type: "integer", minimum: 1 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Unexpected server failure.",
    type: RegistrationErrorResponse,
    example: { statusCode: 500, code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
    headers: responseHeaders,
  })
  @ApiResponse({
    status: 503,
    description: "Recognized persistence connection failure.",
    type: RegistrationErrorResponse,
    example: { statusCode: 503, code: "SERVICE_UNAVAILABLE", message: "Service temporarily unavailable." },
    headers: responseHeaders,
  })
  @Post("register")
  @HttpCode(HttpStatus.ACCEPTED)
  @Header("Cache-Control", "no-store")
  @UseFilters(RegistrationExceptionFilter)
  @UseGuards(RegistrationRateLimitGuard)
  async register(@Body() input: RegisterDto): Promise<RegistrationAcceptedResponse> {
    await this.registrationService.register(input);
    return { message: "Registration request accepted." };
  }
}
