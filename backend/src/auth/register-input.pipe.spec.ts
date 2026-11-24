import { describe, expect, it } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { RegisterDto } from "./register.dto.js";
import { RegisterInputPipe } from "./register-input.pipe.js";

const email: string = "  Alice.Smith+registration@Example.com  ";
const password: string = "  Allowed-Reg-7391!😀  ";

describe("RegisterInputPipe and RegisterDto", () => {
  const pipe: RegisterInputPipe = new RegisterInputPipe();

  it("produces a DTO with derived canonical email and the exact password without mutating the request", () => {
    const request: Readonly<{ email: string; password: string }> = Object.freeze({ email, password });
    const dto: RegisterDto = pipe.transform(request);
    expect(dto).toBeInstanceOf(RegisterDto);
    expect(dto).toEqual({
      email: "Alice.Smith+registration@Example.com",
      emailCanonical: "alice.smith+registration@example.com",
      password,
    });
    expect(request).toEqual({ email, password });
  });

  it("gives direct callers the same validated DTO factory without HTTP or Nest context", () => {
    expect(RegisterDto.fromUnknown({ email, password })).toEqual(pipe.transform({ email, password }));
    expect(() => RegisterDto.fromUnknown({ email, password: "weak" })).toThrow(AuthInputError);
  });

  it("retains code-point length handling for a 128-code-point password", () => {
    const unicodePassword: string = "Aa1!" + "😀".repeat(124);
    expect(pipe.transform({ email, password: unicodePassword }).password).toBe(unicodePassword);
  });

  it.each([
    { label: "null", input: null },
    { label: "an array", input: [] },
    { label: "missing fields", input: {} },
    { label: "a non-string password", input: { email, password: 123 } },
    { label: "an invalid email", input: { email: "invalid", password } },
    { label: "a weak password", input: { email, password: "weak" } },
    { label: "a supplied canonical email", input: { email, password, emailCanonical: "forged@example.com" } },
    { label: "an overlong password", input: { email, password: "Aa1!" + "😀".repeat(125) } },
    { label: "an unpaired surrogate", input: { email, password: "Aa1!valid" + String.fromCharCode(0xd800) } },
  ])("rejects $label through the shared parser", ({ input }) => {
    expect(() => pipe.transform(input)).toThrow(AuthInputError);
  });
});
