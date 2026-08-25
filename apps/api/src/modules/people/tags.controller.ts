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
import type { TagsService } from './tags.service.js';
import type { CreateTagDto, TagPersonDto } from './dto/create-tag.dto.js';

@Controller('api/v1/tags')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HttpCode(201)
  async create(@CurrentActor() actor: Actor | null, @Body() dto: CreateTagDto) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.tagsService.createTag(dto.name);
  }

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.tagsService.listTags();
  }

  @Post('assign')
  @HttpCode(200)
  async assign(@CurrentActor() actor: Actor | null, @Body() dto: TagPersonDto) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    return this.tagsService.tagPerson(dto.personId, dto.tagName);
  }

  @Delete(':personId/:tagName')
  @HttpCode(204)
  async unassign(
    @CurrentActor() actor: Actor | null,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Param('tagName') tagName: string,
  ) {
    assertPermission(actor, PERMISSIONS.PEOPLE_WRITE);
    await this.tagsService.untagPerson(personId, tagName);
  }

  @Get('person/:personId')
  async personTags(
    @CurrentActor() actor: Actor | null,
    @Param('personId', ParseUUIDPipe) personId: string,
  ) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.tagsService.listPersonTags(personId);
  }
}
