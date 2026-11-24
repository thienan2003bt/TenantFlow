/**
 * Custom error class for handling authentication input errors. Using default message as "Invalid authentication input." if not provided.
 */
export class AuthInputError extends Error {
  constructor(message?: string) {
    const msg = message || "Invalid authentication input.";
    super(msg);
    this.name = "AuthInputError";
  }
}
