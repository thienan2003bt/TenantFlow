import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { DataSource, QueryFailedError } from "typeorm";
import { parseAuthInput } from "./auth-input.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";
import { PasswordCredential } from "./password-credential.entity.js";
import { PasswordService } from "./password.service.js";
import { User } from "./user.entity.js";

@Injectable()
export class RegistrationService {
  constructor(
    @Inject(PasswordBlocklistService)
    private readonly passwordBlocklistService: PasswordBlocklistService,
    @Inject(PasswordService)
    private readonly passwordService: PasswordService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a pending local account atomically; existing canonical emails resolve normally.
   * Validates and hashes before opening the transaction. Other failures propagate.
   */
  async register(input: unknown): Promise<void> {
    const { email, emailCanonical, password } = parseAuthInput(input);
    this.passwordBlocklistService.assertAllowed(password);
    const passwordHash = await this.passwordService.hash(password);
    const userId = randomUUID();

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.insert(User, { id: userId, email, emailCanonical });
        await manager.insert(PasswordCredential, { userId, passwordHash });
      });
    } catch (error) {
      if (isCanonicalEmailConflict(error)) {
        return;
      }
      throw error;
    }
  }
}

function isCanonicalEmailConflict(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError: unknown = error.driverError;
  return (
    driverError !== null &&
    typeof driverError === "object" &&
    "code" in driverError &&
    driverError.code === "23505" &&
    "constraint" in driverError &&
    driverError.constraint === "uq_users_email_canonical" &&
    "table" in driverError &&
    driverError.table === "users"
  );
}
