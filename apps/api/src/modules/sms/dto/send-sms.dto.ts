import { IsString, MaxLength } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @MaxLength(20)
  to!: string;

  @IsString()
  @MaxLength(1600)
  body!: string;
}
