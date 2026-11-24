import { parseAuthInput, type ParsedAuthInput } from "./auth-input.js";

/** Validated registration data. The canonical email is derived, never accepted from the client. */
export class RegisterDto {
  private constructor(
    public readonly email: string,
    public readonly emailCanonical: string,
    public readonly password: string,
  ) {}

  static fromUnknown(input: unknown): RegisterDto {
    const { email, emailCanonical, password }: ParsedAuthInput = parseAuthInput(input);
    return new RegisterDto(email, emailCanonical, password);
  }
}
