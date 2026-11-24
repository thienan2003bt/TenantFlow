import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";
import { RegistrationService } from "./registration.service.js";

@Module({
  providers: [PasswordService, PasswordBlocklistService, RegistrationService],
})
export class AuthModule {}
