import { UnsupportedMediaTypeException, type NestApplicationOptions } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { NextFunction, Request, Response } from "express";
import { RequestExceptionFilter } from "./request-exception.filter.js";

export const LOCAL_LISTENER_HOST: string = "127.0.0.1";
export const FRONTEND_ORIGIN: string = "http://localhost:3000";
export const httpApplicationOptions: NestApplicationOptions = { bodyParser: false };

export function configureHttpApplication(app: NestExpressApplication): void {
  app.set("trust proxy", false);
  app.useGlobalFilters(new RequestExceptionFilter());
  app.use("/auth", (_request: Request, response: Response, next: NextFunction): void => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });
  // CORS preflight can finish here; all state-changing requests still reach CSRF.
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allowed: boolean) => void): void => {
      callback(null, origin === FRONTEND_ORIGIN);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "OPTIONS"],
  });
  app.enableCsrfProtection({ trustedOrigins: [FRONTEND_ORIGIN] });
  app.use("/auth", (request: Request, _response: Response, next: NextFunction): void => {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      next();
      return;
    }
    const mediaType: string | undefined = request.headers["content-type"]?.split(";")[0]?.trim().toLowerCase();
    const encoding: string = (request.headers["content-encoding"] ?? "identity").trim().toLowerCase();
    if (mediaType !== "application/json" || encoding !== "identity") {
      next(new UnsupportedMediaTypeException());
      return;
    }
    next();
  });
  app.useBodyParser("json", { type: "application/json", limit: 16_384, inflate: false, strict: true });
}
