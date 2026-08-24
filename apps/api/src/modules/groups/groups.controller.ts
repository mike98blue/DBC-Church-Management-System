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
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { AddGroupMemberDto } from './dto/add-member.dto.js';
import type { CreateGroupDto } from './dto/create-group.dto.js';
import type { GroupsService } from './groups.service.js';

@Controller('api/v1/groups')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.GROUPS_READ);
    return this.groups.list();
  }

  @Get(':id')
  async get(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertPermission(actor, PERMISSIONS.GROUPS_READ);
    return this.groups.get(id);
  }

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateGroupDto) {
    assertPermission(actor, PERMISSIONS.GROUPS_MANAGE);
    return this.groups.create(dto);
  }

  @Post(':id/members')
  @HttpCode(201)
  async addMember(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddGroupMemberDto,
  ) {
    assertPermission(actor, PERMISSIONS.GROUPS_MANAGE);
    return this.groups.addMember(id, dto);
  }

  @Delete(':id/members/:personId')
  @HttpCode(204)
  async removeMember(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('personId', ParseUUIDPipe) personId: string,
  ) {
    assertPermission(actor, PERMISSIONS.GROUPS_MANAGE);
    await this.groups.removeMember(id, personId);
  }
}
