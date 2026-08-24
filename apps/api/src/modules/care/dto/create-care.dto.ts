import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePrayerDto {
  @IsUUID('4')
  personId!: string;

  @IsString()
  @MaxLength(2000)
  request!: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'pastoral_only'])
  visibility?: string;
}

export class CreateCareCaseDto {
  @IsUUID('4')
  personId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;
}

export class AddCareNoteDto {
  @IsString()
  @MaxLength(5000)
  note!: string;
}
