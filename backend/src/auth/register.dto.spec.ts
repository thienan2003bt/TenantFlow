import { BadRequestException, type ArgumentMetadata } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { AuthInputError } from "../errors/auth-input.error.js";
import { RequestValidationPipe } from "../validation/request-validation.pipe.js";
import { RegisterDto } from "./register.dto.js";

const email: string = "  Alice.Smith+registration@Example.com  ";
const password: string = "  Allowed-Reg-7391!😀  ";
const metadata: ArgumentMetadata = { type: "body", metatype: RegisterDto };
const pipe: RequestValidationPipe = new RequestValidationPipe();

async function transform(input: unknown): Promise<RegisterDto> {
  const dto: unknown = await pipe.transform(input, metadata);
  expect(dto).toBeInstanceOf(RegisterDto);
  if (!(dto instanceof RegisterDto)) {
    throw new Error("Expected a validated DTO");
  }
  return dto;
}

describe("RegisterDto with global ValidationPipe", () => {
  it("trims email and preserves the exact password without mutating the request", async () => {
    const request: Readonly<{ email: string; password: string }> = Object.freeze({ email, password });
    const dto: RegisterDto = await transform(request);
    expect(dto).toEqual({ email: "Alice.Smith+registration@Example.com", password });
    expect(request).toEqual({ email, password });
  });

  it("gives direct callers the same validated DTO without an HTTP request", async () => {
    expect(RegisterDto.fromUnknown({ email, password })).toEqual(await transform({ email, password }));
    expect(() => RegisterDto.fromUnknown({ email, password: "weak" })).toThrow(AuthInputError);
  });

  it("accepts 128 Unicode code points even when UTF-16 length exceeds 128", async () => {
    const unicodePassword: string = "Aa1!" + "😀".repeat(124);
    expect((await transform({ email, password: unicodePassword })).password).toBe(unicodePassword);
  });

  it.each([
    { label: "null", input: null },
    { label: "a primitive", input: "credentials" },
    { label: "an array", input: [] },
    { label: "missing fields", input: {} },
    { label: "a non-string password", input: { email, password: 123 } },
    { label: "a non-string email", input: { email: 123, password } },
    { label: "an invalid email", input: { email: "invalid", password } },
    { label: "a weak password", input: { email, password: "weak" } },
    { label: "a supplied canonical email", input: { email, password, emailCanonical: "forged@example.com" } },
    { label: "an overlong password", input: { email, password: "Aa1!" + "😀".repeat(125) } },
    { label: "an unpaired surrogate", input: { email, password: "Aa1!valid" + String.fromCharCode(0xd800) } },
  ])("rejects $label without coercion or credential disclosure", async ({ input }) => {
    try {
      await transform(input);
      expect.fail("Expected invalid input to be rejected");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(BadRequestException);
      if (!(error instanceof BadRequestException)) {
        throw error;
      }
      expect(error.getResponse()).toEqual({
        statusCode: 400,
        code: "INVALID_INPUT",
        message: "Invalid request input.",
      });
    }
  });

  it.each(["__proto__", "constructor", "prototype"])(
    "rejects reserved field %s before Nest can strip it",
    async (key) => {
      const body: Record<string, unknown> = { email, password, [key]: "untrusted" };
      await expect(transform(body)).rejects.toBeInstanceOf(BadRequestException);
      expect(Object.hasOwn(body, key)).toBe(true);
    },
  );
});
