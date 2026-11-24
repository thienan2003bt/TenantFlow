import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { configureHttpApplication, httpApplicationOptions, LOCAL_LISTENER_HOST } from "./http/configure-http.js";

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
    httpApplicationOptions,
  );
  configureHttpApplication(app);
  const configService: ConfigService = app.get(ConfigService);
  const PORT: number = configService.getOrThrow<number>("PORT");
  app.enableShutdownHooks();
  await app.listen(PORT, LOCAL_LISTENER_HOST);
  console.log(`Server is running on http://localhost:${PORT}`);
}

await bootstrap();
