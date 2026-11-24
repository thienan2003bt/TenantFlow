export class RegistrationRateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("Registration rate limit exceeded.");
    this.name = "RegistrationRateLimitError";
  }
}
