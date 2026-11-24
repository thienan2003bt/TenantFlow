import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";
import { RegistrationService } from "./registration.service.js";
import { AuthController } from "./auth.controller.js";
import { RegisterInputPipe } from "./register-input.pipe.js";
import { RegistrationExceptionFilter } from "./registration-exception.filter.js";

@Module({
  providers: [
    PasswordService,
    PasswordBlocklistService,
    RegistrationService,
    RegisterInputPipe,
    RegistrationExceptionFilter,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
