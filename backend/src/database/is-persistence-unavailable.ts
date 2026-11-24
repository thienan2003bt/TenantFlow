import { QueryFailedError } from "typeorm";

const unavailableCodes: ReadonlySet<string> = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "08000", // connection_exception
  "08001", // sqlclient_unable_to_establish_sqlconnection
  "08003", // connection_does_not_exist
  "08006", // connection_failure
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
  "53300", // too_many_connections
]);

/** Classifies failures at the persistence boundary; unknown errors stay unexpected. */
export function isPersistenceUnavailable(error: unknown): boolean {
  const visited: Set<Error> = new Set<Error>();
  let current: unknown = error;

  while (current instanceof Error && !visited.has(current)) {
    visited.add(current);
    if (current instanceof QueryFailedError) {
      current = current.driverError;
      continue;
    }
    if ("code" in current && typeof current.code === "string") {
      return unavailableCodes.has(current.code);
    }
    current = current.cause;
  }
  return false;
}
