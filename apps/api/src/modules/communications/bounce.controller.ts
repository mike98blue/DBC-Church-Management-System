import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import type { BounceService } from './bounce.service.js';
import { type BounceEvent } from './bounce.service.js';

export class BounceWebhookDto {
  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  personId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('api/v1/communications')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class BounceWebhookController {
  constructor(private readonly bounce: BounceService) {}

  @Post('webhook/bounce')
  @HttpCode(200)
  async handle(@Body() dto: BounceWebhookDto) {
    // Public webhook — provider signature would be verified here in production
    // For mock, we accept any payload with a type
    return this.bounce.handle(dto as BounceEvent);
  }
}
