import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { AuthInputError } from "../errors/auth-input.error.js";
import { RegistrationService } from "./registration.service.js";

export interface RegistrationAcceptedResponse {
  message: string;
}

@Controller("auth")
export class AuthController {
  constructor(@Inject(RegistrationService) private readonly registrationService: RegistrationService) {}

  @Post("register")
  @HttpCode(HttpStatus.ACCEPTED)
  async register(
    @Body() input: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RegistrationAcceptedResponse> {
    response.setHeader("Cache-Control", "no-store");

    try {
      await this.registrationService.register(input);
    } catch (error: unknown) {
      if (error instanceof AuthInputError) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: "INVALID_INPUT",
          message: "Invalid registration input.",
        });
      }
      // Raw dependency errors can contain query parameters and credentials.
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      });
    }

    return { message: "Registration request accepted." };
  }
}
