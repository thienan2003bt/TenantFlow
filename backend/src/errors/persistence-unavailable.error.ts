export class PersistenceUnavailableError extends Error {
  constructor(message?: string, cause?: unknown) {
    const msg: string = message ?? "The persistence layer is unavailable. Please try again later.";
    super(msg, { cause });
    this.name = "PersistenceUnavailableError";
  }

  getCause(): unknown {
    return this.cause;
  }
}
