import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from './db/db.module.js';
import { HealthController } from './health/health.controller.js';
import { OidcAuthGuard } from './common/guards/oidc-auth.guard.js';
import { AuditService } from './modules/audit/audit.service.js';
import { BackgroundChecksController } from './modules/backgroundchecks/background-checks.controller.js';
import { BackgroundChecksService } from './modules/backgroundchecks/background-checks.service.js';
import { CareController } from './modules/care/care.controller.js';
import { CareService } from './modules/care/care.service.js';
import { CheckinController } from './modules/checkin/checkin.controller.js';
import { CheckinService } from './modules/checkin/checkin.service.js';
import { CommunicationsController } from './modules/communications/communications.controller.js';
import { CommunicationsService } from './modules/communications/communications.service.js';
import { DashboardController } from './modules/dashboard/dashboard.controller.js';
import { DashboardService } from './modules/dashboard/dashboard.service.js';
import { EventsController } from './modules/events/events.controller.js';
import { EventsService } from './modules/events/events.service.js';
import { FacilityController } from './modules/facility/facility.controller.js';
import { FacilityService } from './modules/facility/facility.service.js';
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
import { SchedulingController } from './modules/scheduling/scheduling.controller.js';
import { SchedulingService } from './modules/scheduling/scheduling.service.js';
import { UsersController } from './modules/users/users.controller.js';
import { UsersService } from './modules/users/users.service.js';
import { WorshipController } from './modules/worship/worship.controller.js';
import { WorshipService } from './modules/worship/worship.service.js';

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
    CareController,
    SchedulingController,
    FacilityController,
    WorshipController,
    CheckinController,
    DashboardController,
    BackgroundChecksController,
    UsersController,
  ],
  providers: [
    { provide: APP_GUARD, useClass: OidcAuthGuard },
    AuditService,
    BackgroundChecksService,
    CareService,
    CheckinService,
    PeopleService,
    HouseholdsService,
    EventsService,
    FormsService,
    GroupsService,
    CommunicationsService,
    GivingService,
    ReportingService,
    ImportService,
    SchedulingService,
    FacilityService,
    WorshipService,
    DashboardService,
    UsersService,
  ],
})
export class AppModule {}
