import { Body, Controller, Header, HttpCode, HttpStatus, Inject, Post, UseFilters } from "@nestjs/common";
import { RegisterDto } from "./register.dto.js";
import { RegistrationExceptionFilter } from "./registration-exception.filter.js";
import { RegistrationService } from "./registration.service.js";

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
  async register(@Body() input: RegisterDto): Promise<RegistrationAcceptedResponse> {
    await this.registrationService.register(input);
    return { message: "Registration request accepted." };
  }
}
