import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { events } from '@churchos/db';
import type { Database } from '@churchos/db';

/**
 * Public iCalendar feed (E-10) — exposes PUBLIC events only, never private.
 * RFC 5545 output with no external dependency.
 */

function icalEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function icalDateTime(date: Date): string {
  return `${date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')}Z`;
}

function foldLine(line: string): string {
  // RFC 5545 3.1: lines <= 75 octets; fold with CRLF + space
  if (line.length <= 73) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 0) {
    chunks.push(` ${rest.slice(0, 72)}`);
    rest = rest.slice(72);
  }
  return chunks.join('\r\n');
}

@Injectable()
export class CalendarService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async buildPublicFeed(): Promise<string> {
    const db = this.requireDb();
    const publicEvents = await db
      .select()
      .from(events)
      .where(eq(events.visibility, 'public'))
      .orderBy(asc(events.startsAt));

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChurchOS//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:ChurchOS Public Events',
    ];

    for (const event of publicEvents) {
      const end = event.endsAt ?? new Date(event.startsAt.getTime() + 60 * 60 * 1000);
      lines.push('BEGIN:VEVENT');
      lines.push(foldLine(`UID:${event.id}@churchos`));
      lines.push(foldLine(`DTSTAMP:${icalDateTime(event.createdAt)}`));
      lines.push(foldLine(`DTSTART:${icalDateTime(event.startsAt)}`));
      lines.push(foldLine(`DTEND:${icalDateTime(end)}`));
      lines.push(foldLine(`SUMMARY:${icalEscape(event.title)}`));
      if (event.description) lines.push(foldLine(`DESCRIPTION:${icalEscape(event.description)}`));
      if (event.location) lines.push(foldLine(`LOCATION:${icalEscape(event.location)}`));
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    return `${lines.join('\r\n')}\r\n`;
  }
}
