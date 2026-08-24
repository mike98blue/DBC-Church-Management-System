import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsUUID('4')
  childPersonId!: string;

  @IsUUID('4')
  eventId!: string;

  @IsOptional()
  @IsUUID('4')
  roomId?: string;
}

export class CheckOutDto {
  @IsString()
  pickupCode!: string;
}
