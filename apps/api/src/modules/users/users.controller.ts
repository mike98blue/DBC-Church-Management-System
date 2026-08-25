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
import type { UpsertUserDto } from './dto/upsert-user.dto.js';
import type { UsersService } from './users.service.js';

@Controller('api/v1/admin/users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(200)
  async upsert(@CurrentActor() actor: Actor | null, @Body() dto: UpsertUserDto) {
    assertPermission(actor, PERMISSIONS.ADMIN_USERS);
    return this.usersService.upsertUser(dto);
  }

  @Get()
  async list(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.ADMIN_USERS);
    return this.usersService.list();
  }

  @Get('by-subject')
  async bySubject(@CurrentActor() actor: Actor | null, @Query('subject') subject: string) {
    assertPermission(actor, PERMISSIONS.ADMIN_USERS);
    return this.usersService.findBySubject(subject);
  }
}
