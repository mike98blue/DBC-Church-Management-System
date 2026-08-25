import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { CreateTemplateDto } from './dto/create-template.dto.js';
import type { SendGroupEmailDto } from './dto/send-group-email.dto.js';
import type { CommunicationsService } from './communications.service.js';

@Controller('api/v1/communications')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CommunicationsController {
  constructor(private readonly comms: CommunicationsService) {}

  @Post('send')
  @HttpCode(201)
  async send(@CurrentActor() actor: Actor | null, @Body() dto: SendGroupEmailDto) {
    assertPermission(actor, PERMISSIONS.COMMUNICATIONS_SEND);
    return this.comms.sendGroupEmail(dto, actor?.id ?? null);
  }

  @Get('messages')
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.COMMUNICATIONS_SEND);
    return this.comms.listMessages();
  }

  @Post('templates')
  @HttpCode(201)
  async createTemplate(@CurrentActor() actor: Actor | null, @Body() dto: CreateTemplateDto) {
    assertPermission(actor, PERMISSIONS.COMMUNICATIONS_SEND);
    return this.comms.createTemplate(dto);
  }

  @Get('templates')
  async listTemplates(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.COMMUNICATIONS_SEND);
    return this.comms.listTemplates();
  }

  @Post('unsubscribe/:personId')
  @HttpCode(204)
  async unsubscribe(@Param('personId', ParseUUIDPipe) personId: string) {
    // Unsubscribe is intentionally public (via token in email) — no permission check for MVP
    await this.comms.unsubscribe(personId);
  }
}
