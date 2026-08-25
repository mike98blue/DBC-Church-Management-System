import { IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateFieldDefinitionDto {
  @IsString()
  @Matches(/^[a-z0-9_]{2,50}$/, { message: 'key must be lowercase letters, numbers, underscores' })
  key!: string;

  @IsString()
  @MaxLength(150)
  label!: string;

  @IsEnum(['text', 'number', 'date', 'boolean', 'select'])
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  options?: string;
}

export class SetFieldValueDto {
  @IsString()
  @Matches(/^[a-z0-9_]{2,50}$/)
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  value?: string;
}

export class GetFieldValuesDto {
  @IsUUID('4')
  personId!: string;
}
