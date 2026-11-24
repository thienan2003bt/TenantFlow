import { describe, expect, it } from "vitest";
import { parseAuthInput } from "./auth-input.js";
import { AuthInputError } from "../errors/auth-input.error.js";

const validEmail = "Alice.Smith+demo@Example.com";
const validPassword = "Test-only1!";

function expectInvalid(input: unknown): void {
  expect(() => parseAuthInput(input)).toThrow(AuthInputError);
}

describe("parseAuthInput", () => {
  describe("request shape", () => {
    it.each([
      { label: "undefined", input: undefined },
      { label: "null", input: null },
      { label: "an empty string", input: "" },
      {
        label: "a JSON string instead of a parsed object",
        input: JSON.stringify({ email: validEmail, password: validPassword }),
      },
      { label: "a number", input: 42 },
      { label: "a boolean", input: true },
      { label: "an empty array", input: [] },
      { label: "an array containing credentials", input: [{ email: validEmail, password: validPassword }] },
      { label: "an empty object", input: {} },
      { label: "a missing email", input: { password: validPassword } },
      { label: "a missing password", input: { email: validEmail } },
    ])("rejects $label", ({ input }) => {
      expectInvalid(input);
    });

    it.each([
      { label: "null", value: null },
      { label: "undefined", value: undefined },
      { label: "a number", value: 12345678 },
      { label: "a boolean", value: false },
      { label: "an array", value: ["value"] },
      { label: "an object", value: { value: "value" } },
      { label: "a boxed string", value: Object("Test-only1!") },
    ])("rejects $label for either field without coercion", ({ value }) => {
      expectInvalid({ email: value, password: validPassword });
      expectInvalid({ email: validEmail, password: value });
    });

    it.each(["role", "emailCanonical", "passwordHash"])("rejects the unknown field %s", (field) => {
      expectInvalid({ email: validEmail, password: validPassword, [field]: "untrusted" });
    });

    it("rejects arrays even when they carry named email/password properties", () => {
      expectInvalid(Object.assign([], { email: validEmail, password: validPassword }));
    });

    it("requires credentials to be own properties rather than inherited values", () => {
      expectInvalid(Object.create({ email: validEmail, password: validPassword }));
    });
  });

  describe("email identity", () => {
    it("preserves display spelling, dots and plus tags while lowercasing canonical identity", () => {
      expect(parseAuthInput({ email: validEmail, password: validPassword })).toEqual({
        email: validEmail,
        emailCanonical: "alice.smith+demo@example.com",
        password: validPassword,
      });
    });

    it.each([
      { label: "spaces", email: `  ${validEmail}  ` },
      { label: "tabs and newlines", email: `\t${validEmail}\r\n` },
    ])("trims surrounding $label before validation and display storage", ({ email }) => {
      expect(parseAuthInput({ email, password: validPassword })).toEqual({
        email: validEmail,
        emailCanonical: "alice.smith+demo@example.com",
        password: validPassword,
      });
    });

    it("gives differently cased spellings the same canonical identity", () => {
      const first = parseAuthInput({ email: validEmail, password: validPassword });
      const second = parseAuthInput({ email: validEmail.toLowerCase(), password: validPassword });
      expect(first.emailCanonical).toBe(second.emailCanonical);
      expect(first.email).not.toBe(second.email);
    });

    it.each([
      { label: "an ASCII punycode domain", email: "user@xn--bcher-kva.de" },
      { label: "a one-character local part", email: "a@example.com" },
      { label: "a 64-character local part", email: `${"a".repeat(64)}@example.com` },
      {
        label: "a 254-character address",
        email: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`,
      },
    ])("accepts $label", ({ email }) => {
      expect(parseAuthInput({ email, password: validPassword }).email).toBe(email);
    });

    it.each([
      { label: "an empty address", email: "" },
      { label: "whitespace only", email: " \t " },
      { label: "a missing at-sign", email: "user.example.com" },
      { label: "a missing local part", email: "@example.com" },
      { label: "a missing domain", email: "user@" },
      { label: "a domain without a dot", email: "user@localhost" },
      { label: "a display name", email: "Alice <alice@example.com>" },
      { label: "a quoted local part", email: '"alice"@example.com' },
      { label: "an IP literal", email: "user@[127.0.0.1]" },
      { label: "a bare IP domain", email: "user@127.0.0.1" },
      { label: "a Unicode local part", email: "jos\u00e9@example.com" },
      { label: "a Unicode domain", email: "user@b\u00fccher.de" },
      { label: "an internal space", email: "ali ce@example.com" },
      { label: "an internal control character", email: "ali\nce@example.com" },
      { label: "consecutive local-part dots", email: "alice..smith@example.com" },
      { label: "a 65-character local part", email: `${"a".repeat(65)}@example.com` },
      {
        label: "a 255-character address",
        email: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}`,
      },
    ])("rejects $label", ({ email }) => {
      expectInvalid({ email, password: validPassword });
    });
  });

  describe("password policy", () => {
    it.each([
      { label: "exactly eight code points", password: "Abcdef1!" },
      { label: "exactly 128 code points", password: `Aa1!${"x".repeat(124)}` },
      {
        label: "eight code points containing supplementary characters",
        password: "Aa1!\u{1f600}\u{1f600}\u{1f600}\u{1f600}",
      },
      { label: "128 code points despite more than 128 UTF-16 code units", password: `Aa1!${"\u{1f600}".repeat(124)}` },
      { label: "spaces around a valid password", password: "  Abcdef1!  " },
      { label: "an ASCII space satisfying the selected validator's symbol rule", password: "Abcdef1 " },
    ])("accepts and preserves $label", ({ password }) => {
      expect(parseAuthInput({ email: validEmail, password }).password).toBe(password);
    });

    it.each([
      { label: "an empty password", password: "" },
      { label: "seven code points despite satisfying composition", password: "Abcde1!" },
      { label: "129 ASCII code points", password: `Aa1!${"x".repeat(125)}` },
      { label: "129 code points containing supplementary characters", password: `Aa1!${"\u{1f600}".repeat(125)}` },
      { label: "six code points that occupy eight UTF-16 code units", password: "Ab1!\u{1f600}\u{1f600}" },
      { label: "a missing lowercase letter", password: "ABCDEFG1!" },
      { label: "a missing uppercase letter", password: "abcdefg1!" },
      { label: "a missing number", password: "Abcdefgh!" },
      { label: "a missing symbol", password: "Abcdefg1" },
      { label: "spaces without required composition", password: "        " },
      { label: "an unpaired high surrogate", password: "Abcdef1!\ud800" },
      { label: "an unpaired low surrogate", password: "Abcdef1!\udc00" },
    ])("rejects $label", ({ password }) => {
      expectInvalid({ email: validEmail, password });
    });

    it("preserves composed and decomposed Unicode without normalization", () => {
      const composed = "Abcdef1!\u00e9";
      const decomposed = "Abcdef1!e\u0301";
      expect(parseAuthInput({ email: validEmail, password: composed }).password).toBe(composed);
      expect(parseAuthInput({ email: validEmail, password: decomposed }).password).toBe(decomposed);
      expect(composed).not.toBe(decomposed);
    });
  });

  describe("result and error boundaries", () => {
    it("does not mutate the caller's object and returns a separate result", () => {
      const input = Object.freeze({ email: validEmail, password: validPassword });
      const result = parseAuthInput(input);
      expect(result).not.toBe(input);
      expect(input).toEqual({ email: validEmail, password: validPassword });
      expect(Object.keys(result).sort()).toEqual(["email", "emailCanonical", "password"]);
    });

    it.each([
      { label: "email validation", input: { email: "invalid-email-marker", password: validPassword } },
      { label: "password validation", input: { email: validEmail, password: "weak-password-marker" } },
    ])("does not expose submitted values through $label errors", ({ input }) => {
      let caught: unknown;
      try {
        parseAuthInput(input);
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(AuthInputError);
      const error = caught as AuthInputError;
      expect(error.name).toBe("AuthInputError");
      const diagnostic = `${error.message}\n${error.stack}\n${JSON.stringify(error)}`;
      expect(diagnostic).not.toContain(input.email);
      expect(diagnostic).not.toContain(input.password);
      expect(error).not.toHaveProperty("input");
      expect(error).not.toHaveProperty("password");
    });
  });
});

describe("AuthInputError", () => {
  it("provides its fixed default message and Error identity", () => {
    const error = new AuthInputError();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AuthInputError");
    expect(error.message).toBe("Invalid authentication input.");
  });

  it("supports a fixed caller-supplied validation message", () => {
    expect(new AuthInputError("Invalid email.").message).toBe("Invalid email.");
  });
});
