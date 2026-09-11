import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { assertCanAccessResource, PERMISSIONS, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { AddMemberDto } from './dto/add-member.dto.js';
import type { CreateHouseholdDto } from './dto/create-household.dto.js';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HouseholdsService } from './households.service.js';

@Controller('api/v1/households')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class HouseholdsController {
  constructor(private readonly households: HouseholdsService) {}

  @Get()
  async list(@CurrentActor() actor: Actor | null, @Query('personId') personId?: string) {
    if (personId) {
      const isSelf = actor?.personId === personId;
      if (!isSelf) assertCanAccessResource(actor, PERMISSIONS.HOUSEHOLDS_READ, false);
      return this.households.list(personId);
    }
    assertCanAccessResource(actor, PERMISSIONS.HOUSEHOLDS_READ, false);
    return this.households.list();
  }

  @Get(':id')
  async get(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertCanAccessResource(actor, PERMISSIONS.HOUSEHOLDS_READ, false);
    return this.households.get(id);
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateHouseholdDto) {
    assertCanAccessResource(actor, PERMISSIONS.HOUSEHOLDS_WRITE, false);
    return this.households.create(dto, actor?.id ?? null);
  }

  @Post(':id/members')
  @HttpCode(201)
  async addMember(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    assertCanAccessResource(actor, PERMISSIONS.HOUSEHOLDS_WRITE, false);
    return this.households.addMember(id, dto, actor?.id ?? null);
  }

  @Delete(':id/members/:personId')
  @HttpCode(204)
  async removeMember(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ) {
    assertCanAccessResource(actor, PERMISSIONS.HOUSEHOLDS_WRITE, false);
    await this.households.removeMember(id, personId, actor?.id ?? null);
  }
}
