import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AddGroupMemberDto {
  @IsUUID('4')
  personId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;
}
