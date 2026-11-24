import { Test } from "@nestjs/testing";
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { PasswordBlocklistService } from "./password-blocklist.service.js";

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});

const actualFs = await vi.importActual<typeof import("node:fs")>("node:fs");

describe("PasswordBlocklistService operational failures", () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReset();
    vi.mocked(readFileSync).mockImplementation(actualFs.readFileSync);
  });

  it.each([0, 1])("fails closed when required asset %i cannot be read", (assetIndex) => {
    const failure = Object.assign(new Error("Synthetic missing asset"), { code: "ENOENT" });
    for (let index = 0; index < assetIndex; index += 1) {
      vi.mocked(readFileSync).mockImplementationOnce(actualFs.readFileSync);
    }
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw failure;
    });
    let caught: unknown;
    try {
      new PasswordBlocklistService();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    expect(caught).not.toBeInstanceOf(AuthInputError);
    expect(caught).toMatchObject({ message: "Required password blocklist data could not be loaded.", cause: failure });
  });

  it.each([0, 1])("rejects a checksum mismatch in required asset %i", (assetIndex) => {
    for (let index = 0; index < assetIndex; index += 1) {
      vi.mocked(readFileSync).mockImplementationOnce(actualFs.readFileSync);
    }
    vi.mocked(readFileSync).mockReturnValueOnce(Buffer.from("tampered\n"));
    expect(() => new PasswordBlocklistService()).toThrow("Required password blocklist data could not be loaded.");
  });

  it.each([0, 1])("rejects an empty required asset %i instead of admitting passwords", (assetIndex) => {
    for (let index = 0; index < assetIndex; index += 1) {
      vi.mocked(readFileSync).mockImplementationOnce(actualFs.readFileSync);
    }
    vi.mocked(readFileSync).mockReturnValueOnce(Buffer.alloc(0));
    expect(() => new PasswordBlocklistService()).toThrow("Required password blocklist data could not be loaded.");
  });

  it("rejects unreadable permissions as an operational failure", () => {
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw Object.assign(new Error("Synthetic permission denial"), { code: "EACCES" });
    });
    expect(() => new PasswordBlocklistService()).toThrow("Required password blocklist data could not be loaded.");
  });

  it("rejects corrupt bytes as an operational failure", () => {
    vi.mocked(readFileSync).mockReturnValueOnce(Buffer.from([0xff, 0xfe]));
    expect(() => new PasswordBlocklistService()).toThrow("Required password blocklist data could not be loaded.");
  });

  it("does file I/O only during construction, never for individual password checks", () => {
    const service = new PasswordBlocklistService();
    expect(readFileSync).toHaveBeenCalledTimes(2);
    expect(() => service.assertAllowed("password")).toThrow(AuthInputError);
    expect(() => service.assertAllowed("Allowed-Example-7391!")).not.toThrow();
    expect(() => service.assertAllowed("Password1!")).toThrow(AuthInputError);
    expect(readFileSync).toHaveBeenCalledTimes(2);
  });

  it("prevents Nest provider construction when required data is unavailable", async () => {
    vi.mocked(readFileSync).mockImplementationOnce(() => {
      throw new Error("Synthetic read failure");
    });
    await expect(Test.createTestingModule({ providers: [PasswordBlocklistService] }).compile()).rejects.toThrow(
      "Required password blocklist data could not be loaded.",
    );
  });
});
