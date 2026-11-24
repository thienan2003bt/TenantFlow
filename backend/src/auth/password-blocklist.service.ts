import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { AuthInputError } from "../errors/auth-input.error.js";

const requiredAssets = [
  {
    url: new URL("./data/password-blocklist/10k-most-common.txt", import.meta.url),
    sha256: "68782d6a4a19a4768d5f15dd66bd534e7a33055cc755411e33f16d18c50fdcce",
  },
  {
    url: new URL("./data/password-blocklist/additional-passwords.txt", import.meta.url),
    sha256: "0c939a3bba2f87de7bed9cf534a6dcdfda9b14bd441f4cf368c89b9f6053a58d",
  },
] as const;

@Injectable()
export class PasswordBlocklistService {
  private readonly blocklist: Set<string>;

  constructor() {
    const passwords = this.loadBlocklist() as Set<string>;
    this.blocklist = passwords;
  }

  /**
   * Loads the password blocklist from the required assets, verifying their integrity and content.
   * @returns {Set<string>} A Set containing all the passwords from the blocklist.
   * @throws {Error} If any of the required assets cannot be loaded, fail integrity checks, or are malformed.
   */
  private loadBlocklist(): Set<string> {
    const passwords = new Set<string>();
    try {
      for (const asset of requiredAssets) {
        const bytes = readFileSync(asset.url);
        if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) {
          throw new Error("Password blocklist asset integrity check failed.");
        }

        const content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        // Remove line separators only. Spaces and case are part of each password.
        const entries = content.split(/\r?\n/).filter((entry) => entry.length > 0);

        if (entries.length === 0 || entries.some((entry) => entry.includes("\0") || entry.includes("\r"))) {
          throw new Error("Password blocklist asset is empty or malformed.");
        }
        for (const entry of entries) {
          passwords.add(entry);
        }
      }
    } catch (cause) {
      // Operational failures abort provider construction rather than admitting passwords.
      throw new Error("Required password blocklist data could not be loaded.", { cause });
    }

    return passwords;
  }

  assertAllowed(password: string): void {
    if (this.blocklist.has(password)) {
      throw new AuthInputError("This password is not allowed in our system. Please choose a different one.");
    }
  }
}
