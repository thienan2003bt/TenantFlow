import { Injectable, type PipeTransform } from "@nestjs/common";
import { RegisterDto } from "./register.dto.js";

@Injectable()
export class RegisterInputPipe implements PipeTransform<unknown, RegisterDto> {
  transform(input: unknown): RegisterDto {
    return RegisterDto.fromUnknown(input);
  }
}
