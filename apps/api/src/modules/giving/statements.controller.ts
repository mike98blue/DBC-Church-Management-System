import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { StatementsService } from './statements.service.js';

@Controller('api/v1/giving')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class StatementsController {
  constructor(private readonly statements: StatementsService) {}

  @Get('statements/:donorId')
  async generate(
    @CurrentActor() actor: Actor | null,
    @Param('donorId', ParseUUIDPipe) donorId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    assertPermission(actor, PERMISSIONS.GIVING_EXPORT);
    return this.statements.generate(donorId, startDate, endDate);
  }
}
