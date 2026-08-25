import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpsertUserDto {
  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  displayName?: string;

  @IsOptional()
  @IsUUID('4')
  personId?: string;
}
