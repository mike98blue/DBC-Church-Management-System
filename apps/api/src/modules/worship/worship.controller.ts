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
import type { AddServiceItemDto, CreateServiceDto, CreateSongDto } from './dto/create-worship.dto.js';
import type { WorshipService } from './worship.service.js';

@Controller('api/v1/worship')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class WorshipController {
  constructor(private readonly worship: WorshipService) {}

  @Post('songs')
  @HttpCode(201)
  async createSong(@CurrentActor() actor: Actor | null, @Body() dto: CreateSongDto) {
    assertPermission(actor, PERMISSIONS.WORSHIP_MANAGE);
    return this.worship.createSong(dto);
  }

  @Get('songs')
  async listSongs(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.WORSHIP_READ);
    return this.worship.listSongs();
  }

  @Post('services')
  @HttpCode(201)
  async createService(@CurrentActor() actor: Actor | null, @Body() dto: CreateServiceDto) {
    assertPermission(actor, PERMISSIONS.WORSHIP_MANAGE);
    return this.worship.createService(dto);
  }

  @Get('services/:id')
  async getService(@CurrentActor() actor: Actor | null, @Param('id', ParseUUIDPipe) id: string) {
    assertPermission(actor, PERMISSIONS.WORSHIP_READ);
    return this.worship.getService(id);
  }

  @Post('services/:id/items')
  @HttpCode(201)
  async addItem(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddServiceItemDto,
  ) {
    assertPermission(actor, PERMISSIONS.WORSHIP_MANAGE);
    return this.worship.addItem(id, dto);
  }
}
