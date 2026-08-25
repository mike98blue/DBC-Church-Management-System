import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { DashboardService } from './dashboard.service.js';

@Controller('api/v1/dashboard')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  async summary(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.dashboard.summary();
  }
}
