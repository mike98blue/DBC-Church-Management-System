import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum([
    'small_group',
    'bible_study',
    'ministry_team',
    'class',
    'volunteer_team',
    'care_team',
    'other',
  ])
  type?: string;

  @IsOptional()
  @IsEnum(['public', 'private', 'hidden'])
  visibility?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
