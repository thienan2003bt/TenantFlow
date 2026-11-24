import { Body, Controller, Header, HttpCode, HttpStatus, Inject, Post, UseFilters, UseGuards } from "@nestjs/common";
import { RegisterDto } from "./register.dto.js";
import { RegistrationExceptionFilter } from "./registration-exception.filter.js";
import { RegistrationService } from "./registration.service.js";
import { RegistrationRateLimitGuard } from "./registration-rate-limit.guard.js";

export interface RegistrationAcceptedResponse {
  message: string;
}

@Controller("auth")
export class AuthController {
  constructor(@Inject(RegistrationService) private readonly registrationService: RegistrationService) {}

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
