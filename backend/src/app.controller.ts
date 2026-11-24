import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service.js";

@ApiTags("Application")
@ApiProduces("text/plain")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Get the API greeting" })
  @ApiOkResponse({ schema: { type: "string", example: "Hello World!" } })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({
    summary: "Check process liveness",
    description: "Does not verify database connectivity or migration readiness.",
  })
  @ApiOkResponse({ schema: { type: "string", example: "Service is healthy!" } })
  @Get("health-check")
  getHealth(): string {
    return this.appService.getHealth();
  }
}
