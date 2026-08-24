import { IsArray, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FormFieldDto {
  @IsString()
  @MaxLength(100)
  key!: string;

  @IsString()
  @MaxLength(200)
  label!: string;

  @IsEnum([
    'text',
    'email',
    'phone',
    'textarea',
    'date',
    'select',
    'multi-select',
    'checkbox',
    'yes/no',
    'consent',
  ])
  type!: string;

  @IsOptional()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class CreateFormDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'authenticated'])
  visibility?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields!: FormFieldDto[];
}
