import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createDatabaseOptions } from "./database.options.js";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createDatabaseOptions({
          DB_HOST: configService.getOrThrow<string>("DB_HOST"),
          DB_PORT: configService.getOrThrow<number>("DB_PORT"),
          DB_USERNAME: configService.getOrThrow<string>("DB_USERNAME"),
          DB_PASSWORD: configService.getOrThrow<string>("DB_PASSWORD"),
          DB_NAME: configService.getOrThrow<string>("DB_NAME"),
        }),
    }),
  ],
})
export class DatabaseModule {}
