import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private'])
  visibility?: 'public' | 'private';

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  // E-02: JSON rule, e.g. {"freq":"weekly","interval":1,"byDay":[0]}
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recurrenceRule?: string;

  @IsOptional()
  @IsDateString()
  recurrenceEndsAt?: string;
}
