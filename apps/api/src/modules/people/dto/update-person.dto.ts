import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PERSON_STATUSES, type PersonStatus } from '@churchos/domain';

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  preferredName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEnum(PERSON_STATUSES as unknown as string[])
  status?: PersonStatus;
}
