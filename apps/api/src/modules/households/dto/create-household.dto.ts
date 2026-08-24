import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateHouseholdDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  memberIds?: string[];
}
