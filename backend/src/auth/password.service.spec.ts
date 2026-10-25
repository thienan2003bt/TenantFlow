import { Test, TestingModule } from "@nestjs/testing";
import * as Argon2 from "argon2";
import { AuthModule } from "./auth.module.js";
import { PasswordService } from "./password.service.js";

describe("PasswordService", () => {
  let service: PasswordService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  afterEach(async () => {
    await module.close();
  });

  it("produces an encoded Argon2id hash with the selected work factors", async () => {
    const encodedHash = await service.hash("test-only passphrase");

    const [, algorithm, version, encodedParameters] = encodedHash.split("$");
    const parameters = Object.fromEntries(encodedParameters.split(",").map((parameter) => parameter.split("=")));

    expect(algorithm).toBe("argon2id");
    expect(version).toBe("v=19");
    expect(parameters).toEqual({ m: "65536", t: "2", p: "1" });
    expect(await Argon2.verify(encodedHash, "test-only passphrase")).toBe(true);
  });

  it("verifies the original password and rejects a different password", async () => {
    const encodedHash = await service.hash("test-only passphrase");

    expect(await service.verify("test-only passphrase", encodedHash)).toBe(true);
    expect(await service.verify("different passphrase", encodedHash)).toBe(false);
  });

  it("generates independently salted hashes that both verify", async () => {
    const firstHash = await service.hash("test-only passphrase");
    const secondHash = await service.hash("test-only passphrase");

    expect(firstHash).not.toBe(secondHash);
    expect(firstHash.split("$")[4]).not.toBe(secondHash.split("$")[4]);
    expect(await service.verify("test-only passphrase", firstHash)).toBe(true);
    expect(await service.verify("test-only passphrase", secondHash)).toBe(true);
  });

  it("preserves leading, trailing and internal password spaces", async () => {
    const password = "  test-only pass phrase  ";
    const encodedHash = await service.hash(password);

    expect(await service.verify(password, encodedHash)).toBe(true);
    expect(await service.verify(password.trim(), encodedHash)).toBe(false);
    expect(await service.verify("  test-only passphrase  ", encodedHash)).toBe(false);
  });

  it("preserves Unicode passwords including supplementary characters", async () => {
    const password = "M\u1eadt kh\u1ea9u \ud83d\udd10 \u65e5\u672c\u8a9e";
    const encodedHash = await service.hash(password);

    expect(await service.verify(password, encodedHash)).toBe(true);
    expect(await service.verify(`${password}!`, encodedHash)).toBe(false);
  });

  it("verifies a persisted hash using the work factors encoded in that hash", async () => {
    const encodedHash = await Argon2.hash("test-only passphrase", {
      type: Argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    expect(await service.verify("test-only passphrase", encodedHash)).toBe(true);
    expect(await service.verify("different passphrase", encodedHash)).toBe(false);
  });

  it("rejects malformed persisted hashes as errors rather than password mismatches", async () => {
    await expect(service.verify("test-only passphrase", "malformed hash")).rejects.toMatchObject({
      message: "Error verifying password",
      cause: expect.any(Error),
    });
  });
});
