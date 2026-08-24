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
import type {
  CreateFacilityDto,
  CreateReservationDto,
  CreateRoomDto,
} from './dto/create-facility.dto.js';
import type { FacilityService } from './facility.service.js';

@Controller('api/v1/facilities')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FacilityController {
  constructor(private readonly facility: FacilityService) {}

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.FACILITY_READ);
    return this.facility.listFacilities();
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateFacilityDto) {
    assertPermission(actor, PERMISSIONS.FACILITY_MANAGE);
    return this.facility.createFacility(dto);
  }

  @Get('rooms')
  async listRooms(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.FACILITY_READ);
    return this.facility.listRooms();
  }

  @Post('rooms')
  @HttpCode(201)
  async createRoom(@CurrentActor() actor: Actor | null, @Body() dto: CreateRoomDto) {
    assertPermission(actor, PERMISSIONS.FACILITY_MANAGE);
    return this.facility.createRoom(dto);
  }

  @Get('reservations')
  async listReservations(@CurrentActor() actor: Actor | null, @Query('roomId') roomId?: string) {
    assertPermission(actor, PERMISSIONS.FACILITY_READ);
    return this.facility.listReservations(roomId);
  }

  @Post('reservations')
  @HttpCode(201)
  async createReservation(@CurrentActor() actor: Actor | null, @Body() dto: CreateReservationDto) {
    assertPermission(actor, PERMISSIONS.FACILITY_MANAGE);
    return this.facility.createReservation({ ...dto, createdBy: actor?.id ?? null });
  }
}
