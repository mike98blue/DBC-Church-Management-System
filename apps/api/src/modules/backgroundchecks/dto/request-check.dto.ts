import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RequestCheckDto {
  @IsUUID('4')
  personId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
