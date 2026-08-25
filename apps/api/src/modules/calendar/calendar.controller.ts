import { Controller, Get, Header } from '@nestjs/common';
import type { CalendarService } from './calendar.service.js';

@Controller('api/v1/calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  /** Public feed — public events only, no auth (E-10). */
  @Get('events.ics')
  @Header('Content-Type', 'text/calendar; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="events.ics"')
  async publicFeed(): Promise<string> {
    return this.calendar.buildPublicFeed();
  }
}
