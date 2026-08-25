import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateFundDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class CreateCheckoutDto {
  @IsString()
  fundId!: string;

  @IsInt()
  @Min(50)
  amountCents!: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateManualEntryDto {
  @IsUUID('4')
  donorPersonId!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsUUID('4')
  fundId!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsIn(['cash', 'check'])
  method!: 'cash' | 'check';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  checkNumber?: string;
}
