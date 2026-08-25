import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { RequestCheckDto } from './dto/request-check.dto.js';
import type { BackgroundChecksService } from './background-checks.service.js';

@Controller('api/v1/background-checks')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class BackgroundChecksController {
  constructor(private readonly checks: BackgroundChecksService) {}

  @Post()
  @HttpCode(201)
  async request(@CurrentActor() actor: Actor | null, @Body() dto: RequestCheckDto) {
    assertPermission(actor, PERMISSIONS.BACKGROUNDCHECK_MANAGE);
    return this.checks.requestCheck(dto.personId, actor?.id ?? null);
  }

  @Get()
  async list(@CurrentActor() actor: Actor | null, @Query('personId') personId?: string) {
    assertPermission(actor, PERMISSIONS.BACKGROUNDCHECK_READ);
    return this.checks.list(personId);
  }
}
