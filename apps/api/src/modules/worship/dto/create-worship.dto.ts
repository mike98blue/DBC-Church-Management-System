import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateSongDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsInt()
  @Min(40)
  tempo?: number;
}

export class CreateServiceDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  serviceDate!: string;
}

export class AddServiceItemDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  songId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsInt()
  order!: number;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;
}
