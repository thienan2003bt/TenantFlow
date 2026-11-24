import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { PasswordBlocklistService } from "../dist/auth/password-blocklist.service.js";
import { AuthInputError } from "../dist/errors/auth-input.error.js";

const source = new URL("../src/auth/data/password-blocklist/", import.meta.url);
const compiled = new URL("../dist/auth/data/password-blocklist/", import.meta.url);
for (const filename of [
  "10k-most-common.txt",
  "additional-passwords.txt",
  "metadata.json",
  "LICENSE-SecLists.txt",
  "README.md",
]) {
  assert.deepEqual(
    readFileSync(new URL(filename, compiled)),
    readFileSync(new URL(filename, source)),
    `${filename}: build asset mismatch`,
  );
}

const previousDirectory = process.cwd();
try {
  process.chdir(tmpdir());
  const service = new PasswordBlocklistService();
  for (const password of ["password", "Password1!", "TenantFlow1!"]) {
    assert.throws(() => service.assertAllowed(password), AuthInputError);
  }
  for (const password of ["Allowed-Example-7391!", " Password1!", "Password1! "]) {
    assert.doesNotThrow(() => service.assertAllowed(password));
  }
} finally {
  process.chdir(previousDirectory);
}
console.log("Compiled blocklist smoke passed: exact build assets, module-relative loading and password checks.");
