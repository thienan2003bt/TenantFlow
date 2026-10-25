import { Injectable } from "@nestjs/common";
import * as Argon2 from "argon2";
import { HashOptions } from "argon2";

@Injectable()
export class PasswordService {
  private hashOptions: HashOptions;

  constructor() {
    this.hashOptions = {
      type: Argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 2,
      parallelism: 1,
    };
  }

  /**
   * Hashes a raw password using Argon2.
   * @param {string} rawPassword The raw password to hash.
   * @returns {string} The hashed password.
   * @throws {Error} Throws an error if hashing fails.
   */
  async hash(rawPassword: string): Promise<string> {
    try {
      const hashedPassword: string = await Argon2.hash(rawPassword, this.hashOptions);
      return hashedPassword;
    } catch (error) {
      throw new Error("Error hashing password", { cause: error });
    }
  }

  /**
   * Verifies a raw password against a hashed password using Argon2.
   * @param {string} rawPassword The raw password to verify.
   * @param {string} hashedPassword The hashed password to compare against.
   * @returns {boolean} True if the passwords match, false otherwise.
   * @throws {Error} Throws an error if verification fails.
   */
  async verify(rawPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid: boolean = await Argon2.verify(hashedPassword, rawPassword);
      return isValid;
    } catch (error) {
      throw new Error("Error verifying password", { cause: error });
    }
  }
}
