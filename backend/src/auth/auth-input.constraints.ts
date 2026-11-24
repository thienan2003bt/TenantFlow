import { ValidatorConstraint, type ValidatorConstraintInterface } from "class-validator";
import { AuthInputError } from "../errors/auth-input.error.js";
import { parseAuthEmail, parseAuthPassword } from "./auth-input.js";

@ValidatorConstraint({ name: "authEmail", async: false })
export class AuthEmailConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    try {
      parseAuthEmail(value);
      return true;
    } catch (error: unknown) {
      if (error instanceof AuthInputError) {
        return false;
      }
      throw error;
    }
  }
}

@ValidatorConstraint({ name: "authPassword", async: false })
export class AuthPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    try {
      parseAuthPassword(value);
      return true;
    } catch (error: unknown) {
      if (error instanceof AuthInputError) {
        return false;
      }
      throw error;
    }
  }
}
