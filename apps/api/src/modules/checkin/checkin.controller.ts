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
import type { CheckInDto, CheckOutDto } from './dto/checkin.dto.js';
import type { CheckinService } from './checkin.service.js';

@Controller('api/v1/checkin')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class CheckinController {
  constructor(private readonly checkin: CheckinService) {}

  @Post('check-in')
  @HttpCode(201)
  async checkIn(@CurrentActor() actor: Actor | null, @Body() dto: CheckInDto) {
    assertPermission(actor, PERMISSIONS.CHECKIN_OPERATE);
    return this.checkin.checkIn(dto, actor?.id ?? null);
  }

  @Post(':id/check-out')
  @HttpCode(200)
  async checkOut(
    @CurrentActor() actor: Actor | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CheckOutDto,
  ) {
    assertPermission(actor, PERMISSIONS.CHECKIN_OPERATE);
    return this.checkin.checkOut(id, dto.pickupCode, actor?.id ?? null);
  }

  @Get('roster')
  async roster(
    @CurrentActor() actor: Actor | null,
    @Query('eventId') eventId: string,
    @Query('roomId') roomId?: string,
  ) {
    assertPermission(actor, PERMISSIONS.CHECKIN_OPERATE);
    return this.checkin.roster(eventId, roomId);
  }
}
