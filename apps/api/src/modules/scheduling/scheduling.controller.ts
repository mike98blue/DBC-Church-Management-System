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
import type { CreateAssignmentDto, CreateAvailabilityDto } from './dto/create-scheduling.dto.js';
import type { SchedulingService } from './scheduling.service.js';

@Controller('api/v1/scheduling')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Post('availability')
  @HttpCode(201)
  async setAvailability(@CurrentActor() actor: Actor | null, @Body() dto: CreateAvailabilityDto) {
    assertPermission(actor, PERMISSIONS.AVAILABILITY_MANAGE);
    return this.scheduling.setAvailability(dto);
  }

  @Get('availability')
  async listAvailability(@CurrentActor() actor: Actor | null, @Query('personId') personId: string) {
    assertPermission(actor, PERMISSIONS.AVAILABILITY_MANAGE);
    return this.scheduling.listAvailability(personId);
  }

  @Post('assignments')
  @HttpCode(201)
  async createAssignment(@CurrentActor() actor: Actor | null, @Body() dto: CreateAssignmentDto) {
    assertPermission(actor, PERMISSIONS.SCHEDULING_MANAGE);
    return this.scheduling.createAssignment(dto);
  }

  @Get('assignments')
  async listAssignments(@CurrentActor() actor: Actor | null, @Query('personId') personId?: string) {
    assertPermission(actor, PERMISSIONS.SCHEDULING_MANAGE);
    return this.scheduling.listAssignments(personId);
  }
}
