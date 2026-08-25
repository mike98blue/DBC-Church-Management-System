import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { CreateEventDto } from './dto/create-event.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { EventsService } from './events.service.js';

@Controller('api/v1/events')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  async list(
    @CurrentActor() actor: Actor | null,
    @Query('includePrivate') includePrivate?: string,
    @Query('occurrences') occurrences?: string,
    @Query('horizonDays') horizonDays?: string,
  ) {
    if (includePrivate === 'true') {
      assertPermission(actor, PERMISSIONS.EVENTS_MANAGE);
      return this.events.listAll();
    }
    if (occurrences === 'true') {
      // E-02: expanded occurrence list for recurring series (public only)
      const horizon = horizonDays ? Number(horizonDays) : undefined;
      return this.events.listPublicOccurrences(
        Number.isFinite(horizon) && (horizon as number) > 0 && (horizon as number) <= 365
          ? (horizon as number)
          : undefined,
      );
    }
    return this.events.listPublic();
  }

  @Get(':id')
  async get(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    const event = await this.events.get(id);
    if (event.visibility === 'private') {
      assertPermission(actor, PERMISSIONS.EVENTS_MANAGE);
    }
    return event;
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateEventDto) {
    assertPermission(actor, PERMISSIONS.EVENTS_MANAGE);
    return this.events.create(dto);
  }

  @Post(':id/registrations')
  @HttpCode(201)
  async register(@Param('id', ParseUUIDPipe) id: string, @Body() dto: RegisterDto) {
    return this.events.register(id, dto);
  }

  @Get(':id/registrations')
  async listRegistrations(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertPermission(actor, PERMISSIONS.EVENTS_MANAGE);
    return this.events.listRegistrations(id);
  }

  @Post(':id/attendance')
  @HttpCode(201)
  async recordAttendance(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { personId: string },
  ) {
    assertPermission(actor, PERMISSIONS.ATTENDANCE_RECORD);
    return this.events.recordAttendance(id, body.personId, actor?.id ?? null);
  }

  @Get(':id/attendance')
  async listAttendance(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    assertPermission(actor, PERMISSIONS.ATTENDANCE_RECORD);
    return this.events.listAttendance(id);
  }
}
