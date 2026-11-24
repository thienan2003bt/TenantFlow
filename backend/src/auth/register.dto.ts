import { Transform, type TransformFnParams } from "class-transformer";
import { Validate } from "class-validator";
import { parseAuthInput, type ParsedAuthInput } from "./auth-input.js";
import { AuthEmailConstraint, AuthPasswordConstraint } from "./auth-input.constraints.js";

export class RegisterDto {
  @Transform(({ value }: TransformFnParams) => (typeof value === "string" ? value.trim() : value), {
    toClassOnly: true,
  })
  @Validate(AuthEmailConstraint)
  readonly email!: string;

  @Validate(AuthPasswordConstraint)
  readonly password!: string;

  /** Direct callers use the same input rules without a Nest request context. */
  static fromUnknown(input: unknown): RegisterDto {
    const { email, password }: ParsedAuthInput = parseAuthInput(input);
    return Object.assign(new RegisterDto(), { email, password });
  }
}
