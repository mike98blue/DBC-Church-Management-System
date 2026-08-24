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
import type { AddCareNoteDto, CreateCareCaseDto, CreatePrayerDto } from './dto/create-care.dto.js';
import type { CareService } from './care.service.js';

@Controller('api/v1/care')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CareController {
  constructor(private readonly care: CareService) {}

  @Post('prayers')
  @HttpCode(201)
  async createPrayer(@CurrentActor() actor: Actor | null, @Body() dto: CreatePrayerDto) {
    assertPermission(actor, PERMISSIONS.PRAYER_READ);
    return this.care.createPrayer(dto);
  }

  @Get('prayers')
  async listPrayers(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.PRAYER_READ);
    const canSeePastoralOnly = actor?.permissions.includes(PERMISSIONS.CARE_READ) ?? false;
    return this.care.listPrayers(canSeePastoralOnly);
  }

  @Post('cases')
  @HttpCode(201)
  async createCase(@CurrentActor() actor: Actor | null, @Body() dto: CreateCareCaseDto) {
    assertPermission(actor, PERMISSIONS.CARE_WRITE);
    return this.care.createCase(dto);
  }

  @Get('cases/:id')
  async getCase(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertPermission(actor, PERMISSIONS.CARE_READ);
    return this.care.getCase(id);
  }

  @Post('cases/:id/notes')
  @HttpCode(201)
  async addNote(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCareNoteDto,
  ) {
    assertPermission(actor, PERMISSIONS.CARE_WRITE);
    return this.care.addNote(id, actor?.id ?? null, dto.note);
  }
}
