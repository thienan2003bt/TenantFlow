import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";
import { RegistrationService } from "./registration.service.js";
import { AuthController } from "./auth.controller.js";

@Module({
  providers: [PasswordService, PasswordBlocklistService, RegistrationService],
  controllers: [AuthController],
})
export class AuthModule {}
