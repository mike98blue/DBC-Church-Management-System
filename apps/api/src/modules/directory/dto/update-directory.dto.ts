import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDirectoryDto {
  @IsOptional()
  @IsBoolean()
  showInDirectory?: boolean;

  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;
}
