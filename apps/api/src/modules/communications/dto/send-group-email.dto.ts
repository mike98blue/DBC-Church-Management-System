import { IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendGroupEmailDto {
  @IsOptional()
  @IsUUID('4')
  groupId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  personIds?: string[];

  @IsString()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MaxLength(10000)
  body!: string;
}
