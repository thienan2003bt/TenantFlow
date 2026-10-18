import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  // Create a NestJS application instance
  const app = await NestFactory.create(AppModule);

  // Load the configuration service to access environment variables
  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>("PORT") ?? 3000;

  // TODO: Enable CORS for allowed origins only
  app.enableCors();

  // Enable shutdown hooks to gracefully handle application termination
  app.enableShutdownHooks();

  // Start the server and listen on the specified port
  await app.listen(PORT);
  console.log(`Server is running on http://localhost:${PORT}`);
}

await bootstrap();
