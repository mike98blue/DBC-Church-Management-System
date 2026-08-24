import { Controller, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { PERMISSIONS, assertPermission, type Actor } from '@churchos/auth';
import { CurrentActor } from '../../common/decorators/current-actor.decorator.js';
import type { ReportingService } from './reporting.service.js';

@Controller('api/v1/reports')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get('people/counts')
  async peopleCounts(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.PEOPLE_READ);
    return this.reporting.peopleCounts();
  }

  @Get('giving/by-fund')
  async givingByFund(@CurrentActor() actor: Actor | null) {
    assertPermission(actor, PERMISSIONS.GIVING_READ);
    return this.reporting.givingByFund();
  }
}
