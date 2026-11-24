import { ApiProperty } from "@nestjs/swagger";
import { Transform, type TransformFnParams } from "class-transformer";
import { Validate } from "class-validator";
import { parseAuthInput, type ParsedAuthInput } from "./auth-input.js";
import { AuthEmailConstraint, AuthPasswordConstraint } from "./auth-input.constraints.js";

export class RegisterDto {
  @ApiProperty({
    type: String,
    example: "swagger-check@example.com",
    description:
      "ASCII mailbox with a dotted DNS domain; outer whitespace is trimmed. Up to 254 characters after trimming, with a local part up to 64. Canonical comparison lowercases the whole address.",
  })
  @Transform(({ value }: TransformFnParams) => (typeof value === "string" ? value.trim() : value), {
    toClassOnly: true,
  })
  @Validate(AuthEmailConstraint)
  readonly email!: string;

  @ApiProperty({
    type: String,
    format: "password",
    minLength: 8,
    maxLength: 128,
    example: "Allowed-Reg-7391!",
    description: `8–128 Unicode code points, with ASCII lowercase, uppercase, a digit and a validator-recognized symbol (including space). Exact string: no trimming or normalization. Unpaired surrogates and blocklisted passwords are rejected.`,
  })
  @Validate(AuthPasswordConstraint)
  readonly password!: string;

  /** Direct callers use the same input rules without a Nest request context. */
  static fromUnknown(input: unknown): RegisterDto {
    const { email, password }: ParsedAuthInput = parseAuthInput(input);
    return Object.assign(new RegisterDto(), { email, password });
  }
}
