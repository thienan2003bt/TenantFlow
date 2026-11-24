import { Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { RegistrationRateLimitError } from "../errors/registration-rate-limit.error.js";

interface AttemptWindow {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RegistrationRateLimitGuard implements CanActivate {
  private readonly attempts: Map<string, AttemptWindow> = new Map<string, AttemptWindow>();

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const now: number = Date.now();
    for (const [key, window] of this.attempts) {
      if (window.expiresAt <= now) {
        this.attempts.delete(key);
      }
    }

    // Direct socket identity only: forwarded headers cannot create fresh buckets.
    const key: string = "auth:register:" + (request.socket.remoteAddress ?? "unknown");
    const window: AttemptWindow = this.attempts.get(key) ?? { count: 0, expiresAt: now + 3_600_000 }; // 1 hour
    if (window.count >= 5) {
      throw new RegistrationRateLimitError(Math.max(1, Math.ceil((window.expiresAt - now) / 1000)));
    }
    window.count += 1;
    this.attempts.set(key, window);
    return true;
  }
}
