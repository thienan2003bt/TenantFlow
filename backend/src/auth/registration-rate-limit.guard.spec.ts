import type { ExecutionContext } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { RegistrationRateLimitError } from "../errors/registration-rate-limit.error.js";
import { RegistrationRateLimitGuard } from "./registration-rate-limit.guard.js";

function contextFor(remoteAddress: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ socket: { remoteAddress } }) }),
  } as unknown as ExecutionContext;
}

describe("RegistrationRateLimitGuard socket identity", () => {
  it("isolates clients by direct socket address", () => {
    const guard: RegistrationRateLimitGuard = new RegistrationRateLimitGuard();
    const first: ExecutionContext = contextFor("127.0.0.1");
    const second: ExecutionContext = contextFor("127.0.0.2");
    for (let attempt: number = 0; attempt < 5; attempt += 1) {
      expect(guard.canActivate(first)).toBe(true);
    }
    expect(() => guard.canActivate(first)).toThrow(RegistrationRateLimitError);
    expect(guard.canActivate(second)).toBe(true);
  });

  it("shares a limited fallback bucket when no socket identity is available", () => {
    const guard: RegistrationRateLimitGuard = new RegistrationRateLimitGuard();
    for (let attempt: number = 0; attempt < 5; attempt += 1) {
      expect(guard.canActivate(contextFor(undefined))).toBe(true);
    }
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(RegistrationRateLimitError);
  });
});
