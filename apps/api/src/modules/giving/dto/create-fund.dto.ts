import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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
