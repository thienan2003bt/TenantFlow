import { Test, TestingModule } from "@nestjs/testing";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { parseAuthInput } from "./auth-input.js";
import { AuthModule } from "./auth.module.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";

const dataDirectory = new URL("./data/password-blocklist/", import.meta.url);
const snapshot = readFileSync(new URL("10k-most-common.txt", dataDirectory));
const snapshotEntries = snapshot.toString("utf8").split(/\r?\n/).filter(Boolean);
const additional = readFileSync(new URL("additional-passwords.txt", dataDirectory));
const additionalEntries = additional.toString("utf8").split(/\r?\n/).filter(Boolean);
const allEntries = new Set([...snapshotEntries, ...additionalEntries]);

describe("PasswordBlocklistService bundled data", () => {
  let module: TestingModule;
  let service: PasswordBlocklistService;

  beforeAll(async () => {
    module = await Test.createTestingModule({ imports: [AuthModule] }).compile();
    service = module.get(PasswordBlocklistService);
  });

  afterAll(async () => {
    await module?.close();
  });

  it("loads through the actual AuthModule without a caller supplying a list", () => {
    expect(service).toBeInstanceOf(PasswordBlocklistService);
    expect(() => service.assertAllowed("password")).toThrow(AuthInputError);
  });

  it("rejects every entry in the pinned upstream snapshot", () => {
    expect(snapshotEntries).toHaveLength(10001);
    for (const password of snapshotEntries) {
      expect(() => service.assertAllowed(password)).toThrow(AuthInputError);
    }
  });

  it("rejects every separately maintained additional entry", () => {
    expect(additionalEntries.length).toBeGreaterThan(0);
    for (const password of additionalEntries) {
      expect(() => service.assertAllowed(password)).toThrow(AuthInputError);
    }
  });

  it("rejects a common password even when it passes the structural composition rules", () => {
    const input = parseAuthInput({ email: "blocklist.check@example.com", password: "Password1!" });
    expect(() => service.assertAllowed(input.password)).toThrow(AuthInputError);
  });

  it.each([
    { label: "an unlisted passphrase", password: "Allowed-Example-7391!" },
    { label: "a different case", password: "PASSWORD1!" },
    { label: "a leading space", password: " Password1!" },
    { label: "a trailing space", password: "Password1! " },
    { label: "a blocked value as a substring", password: "Allowed-Password1!-7391" },
    { label: "composed Unicode", password: "Allowed-Example-7391!\u00e9" },
    { label: "decomposed Unicode", password: "Allowed-Example-7391!e\u0301" },
  ])("permits $label by exact whole-password comparison", ({ password }) => {
    expect(allEntries.has(password)).toBe(false);
    expect(() => service.assertAllowed(password)).not.toThrow();
  });

  it("retains the loaded list across repeated allowed and rejected checks", () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(() => service.assertAllowed("Password1!")).toThrow(AuthInputError);
      expect(() => service.assertAllowed("Allowed-Example-7391!")).not.toThrow();
      expect(() => service.assertAllowed("password")).toThrow(AuthInputError);
    }
  });

  it("does not include the submitted password in error diagnostics", () => {
    let caught: unknown;
    try {
      service.assertAllowed("Password1!");
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AuthInputError);
    const error = caught as AuthInputError;
    expect(`${error.message}\n${error.stack}\n${JSON.stringify(error)}`).not.toContain("Password1!");
    expect(error).not.toHaveProperty("password");
  });

  it("keeps source identity, exact-byte checksums and the upstream license with the assets", () => {
    const metadata = JSON.parse(readFileSync(new URL("metadata.json", dataDirectory), "utf8"));
    expect(metadata.source.commit).toMatch(/^[a-f0-9]{40}$/);
    expect(metadata.source.path).toBe("Passwords/Common-Credentials/10k-most-common.txt");
    expect(metadata.source.entryCount).toBe(snapshotEntries.length);
    expect(metadata.source.sha256).toBe(createHash("sha256").update(snapshot).digest("hex"));
    expect(metadata.additional.sha256).toBe(createHash("sha256").update(additional).digest("hex"));
    expect(metadata.additional.entryCount).toBe(additionalEntries.length);
    const blobHash = createHash("sha1").update(`blob ${snapshot.length}\0`).update(snapshot).digest("hex");
    expect(metadata.source.gitBlobSha).toBe(blobHash);
    const license = readFileSync(new URL("LICENSE-SecLists.txt", dataDirectory));
    expect(license.toString("utf8")).toContain("MIT License");
    expect(metadata.source.licenseSha256).toBe(createHash("sha256").update(license).digest("hex"));
  });
});
