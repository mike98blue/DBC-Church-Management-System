import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { SendSmsDto } from './dto/send-sms.dto.js';
import type { SmsService } from './sms.service.js';

@Controller('api/v1/sms')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SmsController {
  constructor(private readonly sms: SmsService) {}

  @Post('send')
  @HttpCode(201)
  async send(@CurrentActor() actor: Actor | null, @Body() dto: SendSmsDto) {
    assertPermission(actor, PERMISSIONS.COMMUNICATIONS_SEND);
    return this.sms.send(dto.to, dto.body);
  }
}
