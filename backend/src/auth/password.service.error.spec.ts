import * as Argon2 from "argon2";
import { PasswordService } from "./password.service.js";

vi.mock("argon2", async (importOriginal) => {
  const actual = await importOriginal<typeof import("argon2")>();

  return {
    ...actual,
    hash: vi.fn(),
    verify: vi.fn(),
  };
});

describe("PasswordService library failures", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("preserves the original cause when hashing fails", async () => {
    const failure = new Error("synthetic hashing failure");
    vi.mocked(Argon2.hash).mockRejectedValueOnce(failure);

    await expect(new PasswordService().hash("test-only passphrase")).rejects.toMatchObject({
      message: "Error hashing password",
      cause: failure,
    });
  });

  it("preserves verification failures instead of converting them to false", async () => {
    const failure = new Error("synthetic verification failure");
    vi.mocked(Argon2.verify).mockRejectedValueOnce(failure);

    await expect(new PasswordService().verify("test-only passphrase", "synthetic stored hash")).rejects.toMatchObject({
      message: "Error verifying password",
      cause: failure,
    });
  });
});
