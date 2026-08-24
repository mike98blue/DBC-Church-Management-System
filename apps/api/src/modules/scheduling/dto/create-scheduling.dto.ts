import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAvailabilityDto {
  @IsUUID('4')
  personId!: string;

  @IsDateString()
  date!: string;

  @IsEnum(['available', 'unavailable', 'maybe'])
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateAssignmentDto {
  @IsUUID('4')
  personId!: string;

  @IsOptional()
  @IsUUID('4')
  groupId?: string;

  @IsOptional()
  @IsUUID('4')
  eventId?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsDateString()
  scheduledFor!: string;
}
