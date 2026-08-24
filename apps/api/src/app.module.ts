import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MockAuthGuard } from './common/guards/mock-auth.guard.js';
import { DbModule } from './db/db.module.js';
import { HealthController } from './health/health.controller.js';
import { AuditService } from './modules/audit/audit.service.js';
import { EventsController } from './modules/events/events.controller.js';
import { EventsService } from './modules/events/events.service.js';
import { HouseholdsController } from './modules/households/households.controller.js';
import { HouseholdsService } from './modules/households/households.service.js';
import { PeopleController } from './modules/people/people.controller.js';
import { PeopleService } from './modules/people/people.service.js';

@Module({
  imports: [DbModule],
  controllers: [HealthController, PeopleController, HouseholdsController, EventsController],
  providers: [
    { provide: APP_GUARD, useClass: MockAuthGuard },
    AuditService,
    PeopleService,
    HouseholdsService,
    EventsService,
  ],
})
export class AppModule {}
