import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateFacilityDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  campus?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateRoomDto {
  @IsOptional()
  @IsUUID('4')
  facilityId?: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}

export class CreateReservationDto {
  @IsUUID('4')
  roomId!: string;

  @IsOptional()
  @IsUUID('4')
  resourceId?: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  startsAt!: string;

  @IsString()
  endsAt!: string;
}
