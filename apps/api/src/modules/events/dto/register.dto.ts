import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsUUID('4')
  personId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;
}
