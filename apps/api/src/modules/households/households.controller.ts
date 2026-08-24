import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { assertPermission, PERMISSIONS, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { AddMemberDto } from './dto/add-member.dto.js';
import type { CreateHouseholdDto } from './dto/create-household.dto.js';
import type { HouseholdsService } from './households.service.js';

@Controller('api/v1/households')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class HouseholdsController {
  constructor(private readonly households: HouseholdsService) {}

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.HOUSEHOLDS_READ);
    return this.households.list();
  }

  @Get(':id')
  async get(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertPermission(actor, PERMISSIONS.HOUSEHOLDS_READ);
    return this.households.get(id);
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateHouseholdDto) {
    assertPermission(actor, PERMISSIONS.HOUSEHOLDS_WRITE);
    return this.households.create(dto, actor?.id ?? null);
  }

  @Post(':id/members')
  @HttpCode(201)
  async addMember(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    assertPermission(actor, PERMISSIONS.HOUSEHOLDS_WRITE);
    return this.households.addMember(id, dto, actor?.id ?? null);
  }

  @Delete(':id/members/:personId')
  @HttpCode(204)
  async removeMember(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ) {
    assertPermission(actor, PERMISSIONS.HOUSEHOLDS_WRITE);
    await this.households.removeMember(id, personId, actor?.id ?? null);
  }
}
