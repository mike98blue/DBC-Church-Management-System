import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MockAuthGuard } from './common/guards/mock-auth.guard.js';
import { DbModule } from './db/db.module.js';
import { HealthController } from './health/health.controller.js';
import { AuditService } from './modules/audit/audit.service.js';
import { CommunicationsController } from './modules/communications/communications.controller.js';
import { CommunicationsService } from './modules/communications/communications.service.js';
import { EventsController } from './modules/events/events.controller.js';
import { EventsService } from './modules/events/events.service.js';
import { FormsController } from './modules/forms/forms.controller.js';
import { FormsService } from './modules/forms/forms.service.js';
import { GivingController } from './modules/giving/giving.controller.js';
import { GivingService } from './modules/giving/giving.service.js';
import { GroupsController } from './modules/groups/groups.controller.js';
import { GroupsService } from './modules/groups/groups.service.js';
import { HouseholdsController } from './modules/households/households.controller.js';
import { HouseholdsService } from './modules/households/households.service.js';
import { ImportController } from './modules/import/import.controller.js';
import { ImportService } from './modules/import/import.service.js';
import { PeopleController } from './modules/people/people.controller.js';
import { PeopleService } from './modules/people/people.service.js';
import { ReportingController } from './modules/reporting/reporting.controller.js';
import { ReportingService } from './modules/reporting/reporting.service.js';

@Module({
  imports: [DbModule],
  controllers: [
    HealthController,
    PeopleController,
    HouseholdsController,
    EventsController,
    FormsController,
    GroupsController,
    CommunicationsController,
    GivingController,
    ReportingController,
    ImportController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: MockAuthGuard },
    AuditService,
    PeopleService,
    HouseholdsService,
    EventsService,
    FormsService,
    GroupsService,
    CommunicationsService,
    GivingService,
    ReportingService,
    ImportService,
  ],
})
export class AppModule {}
