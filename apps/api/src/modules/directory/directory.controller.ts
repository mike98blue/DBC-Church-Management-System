import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { UpdateDirectoryDto } from './dto/update-directory.dto.js';
import type { DirectoryService } from './directory.service.js';

@Controller('api/v1/directory')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class DirectoryController {
  constructor(private readonly directory: DirectoryService) {}

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.DIRECTORY_READ);
    return this.directory.list();
  }

  @Get('preferences/:personId')
  async getPreferences(
    @CurrentActor() actor: Actor | null,
    @Param('personId', ParseUUIDPipe) personId: string,
  ) {
    // Allow self or directory.manage
    if (actor?.personId !== personId) {
      assertPermission(actor, PERMISSIONS.DIRECTORY_MANAGE);
    }
    return this.directory.getPreferences(personId);
  }

  @Put('preferences/:personId')
  async updatePreferences(
    @CurrentActor() actor: Actor | null,
    @Param('personId', ParseUUIDPipe) personId: string,
    @Body() dto: UpdateDirectoryDto,
  ) {
    if (actor?.personId !== personId) {
      assertPermission(actor, PERMISSIONS.DIRECTORY_MANAGE);
    }
    return this.directory.updatePreferences(personId, dto);
  }
}
