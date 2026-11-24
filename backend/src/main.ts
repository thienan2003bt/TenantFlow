import { Environment } from "@enums/environment.enum.ts";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { configureHttpApplication, httpApplicationOptions, LOCAL_LISTENER_HOST } from "./http/configure-http.js";
import { configureOpenApi } from "./http/configure-openapi.js";

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
    httpApplicationOptions,
  );
  configureHttpApplication(app);
  const configService: ConfigService = app.get(ConfigService);
  const PORT: number = configService.getOrThrow<number>("PORT");
  configureOpenApi(app, configService.getOrThrow<Environment>("NODE_ENV"));
  app.enableShutdownHooks();
  await app.listen(PORT, LOCAL_LISTENER_HOST);
  console.log(`Server is running on http://localhost:${PORT}`);
}

await bootstrap();
