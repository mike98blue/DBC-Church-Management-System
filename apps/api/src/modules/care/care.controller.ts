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
import { assertCanAccessResource, PERMISSIONS, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { AddCareNoteDto, CreateCareCaseDto, CreatePrayerDto } from './dto/create-care.dto.js';
import type { CareService } from './care.service.js';

@Controller('api/v1/care')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CareController {
  constructor(private readonly care: CareService) {}

  @Post('prayers')
  @HttpCode(201)
  async createPrayer(@CurrentActor() actor: Actor | null, @Body() dto: CreatePrayerDto) {
    assertCanAccessResource(actor, PERMISSIONS.PRAYER_WRITE, false);
    return this.care.createPrayer(dto, actor?.id ?? null);
  }

  @Get('prayers')
  async listPrayers(@CurrentActor() actor: Actor | null) {
    assertCanAccessResource(actor, PERMISSIONS.PRAYER_READ, false);
    const canSeePastoralOnly = actor?.permissions.includes(PERMISSIONS.CARE_READ) ?? false;
    return this.care.listPrayers(canSeePastoralOnly);
  }

  @Post('cases')
  @HttpCode(201)
  async createCase(@CurrentActor() actor: Actor | null, @Body() dto: CreateCareCaseDto) {
    assertCanAccessResource(actor, PERMISSIONS.CARE_WRITE, false);
    return this.care.createCase(dto, actor?.id ?? null);
  }

  @Get('cases/:id')
  async getCase(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertCanAccessResource(actor, PERMISSIONS.CARE_READ, false);
    return this.care.getCase(id, actor?.id ?? null);
  }

  @Post('cases/:id/notes')
  @HttpCode(201)
  async addNote(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCareNoteDto,
  ) {
    assertCanAccessResource(actor, PERMISSIONS.CARE_WRITE, false);
    return this.care.addNote(id, actor?.id ?? null, dto.note);
  }
}
