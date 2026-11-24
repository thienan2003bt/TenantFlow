import { Environment } from "@enums/environment.enum.ts";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
  type ReferenceObject,
  type SchemaObject,
} from "@nestjs/swagger";

export function configureOpenApi(app: NestExpressApplication, environment: Environment): void {
  if (environment !== Environment.DEVELOPMENT) {
    return;
  }
  const config: Omit<OpenAPIObject, "paths"> = new DocumentBuilder()
    .setTitle("TenantFlow API")
    .setDescription(
      "Local development API. Try it out sends real requests; registration creates pending accounts and allows five attempts per IP per hour.",
    )
    .setVersion("0.0.1")
    .build();
  const documentFactory: () => OpenAPIObject = () => {
    const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
    const inputSchema: SchemaObject | ReferenceObject | undefined = document.components?.schemas?.RegisterDto;
    // The custom input validator rejects unknown keys; reflection cannot infer that rule.
    if (inputSchema && !("$ref" in inputSchema)) {
      inputSchema.additionalProperties = false;
    }
    return document;
  };
  SwaggerModule.setup("docs", app, documentFactory, {
    raw: ["json"],
    customSiteTitle: "TenantFlow API",
    swaggerOptions: { validatorUrl: null, persistAuthorization: false },
  });
}
