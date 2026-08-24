import { IsEnum, IsUUID } from 'class-validator';
import { HOUSEHOLD_ROLES, type HouseholdRole } from '@churchos/domain';

export class AddMemberDto {
  @IsUUID('4')
  personId!: string;

  @IsEnum(HOUSEHOLD_ROLES as unknown as string[])
  role!: HouseholdRole;
}
