import { ApiProperty } from "@nestjs/swagger";

export class RegistrationAcceptedResponse {
  @ApiProperty({ example: "Registration request accepted." })
  message!: string;
}

export class RegistrationErrorResponse {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;
}
