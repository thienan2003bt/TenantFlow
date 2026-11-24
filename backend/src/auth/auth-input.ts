import { isEmail, isStrongPassword } from "class-validator";
import { AuthInputError } from "../errors/auth-input.error.js";

export interface ParsedAuthInput {
  email: string;
  emailCanonical: string;
  password: string;
}

export function parseAuthInput(input: unknown): ParsedAuthInput {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new AuthInputError("Input must be a valid object.");
  }

  if (Reflect.ownKeys(input).length !== 2 || !Object.hasOwn(input, "email") || !Object.hasOwn(input, "password")) {
    throw new AuthInputError("Input must contain only 'email' and 'password' properties.");
  }

  const { email: rawEmail, password } = input as Record<string, unknown>;
  if (typeof rawEmail !== "string") {
    throw new AuthInputError("Email is required and must be a valid email address.");
  }
  if (typeof password !== "string") {
    throw new AuthInputError("Password is required and must be a valid password.");
  }

  const email = rawEmail.trim();
  const localPartLength = email.indexOf("@");
  if (
    email.length > 254 ||
    localPartLength < 1 ||
    localPartLength > 64 ||
    !/^[!-~]+$/.test(email) ||
    email.includes('"') ||
    !isEmail(email, {
      allow_display_name: false,
      allow_utf8_local_part: false,
      require_tld: true,
      allow_ip_domain: false,
      domain_specific_validation: false,
    })
  ) {
    throw new AuthInputError("Email is required and must be a valid email address.");
  }

  // String iteration counts code points; an unpaired surrogate remains a single code unit.
  let passwordLength = 0;
  for (const character of password) {
    const codeUnit = character.charCodeAt(0);
    if (character.length === 1 && codeUnit >= 0xd800 && codeUnit <= 0xdfff) {
      throw new AuthInputError("Password is required and must be a valid password.");
    }
    passwordLength += 1;
    if (passwordLength > 128) {
      throw new AuthInputError("Password is required and must be a valid password.");
    }
  }

  if (
    passwordLength < 8 ||
    !isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new AuthInputError("Password is required and must be a valid password.");
  }

  return {
    email,
    emailCanonical: email.toLowerCase(),
    password,
  };
}
