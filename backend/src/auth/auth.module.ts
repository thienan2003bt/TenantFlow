import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";

@Module({
  providers: [PasswordService, PasswordBlocklistService],
})
export class AuthModule {}
