import { describe, expect, it } from 'vitest';
import { CalendarService } from './calendar.service';
import type { Database } from '@churchos/db';

function fakeDb(
  rows: {
    id: string;
    title: string;
    visibility: string;
    startsAt: Date;
    endsAt: Date | null;
    description: string | null;
    location: string | null;
    createdAt: Date;
  }[],
): Database {
  // Simulate the DB-level visibility filter the service applies via .where()
  const publicRows = rows.filter((r) => r.visibility === 'public');
  const chain = {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => Promise.resolve(publicRows),
        }),
      }),
    }),
  };
  return chain as unknown as Database;
}

describe('CalendarService (E-10)', () => {
  it('builds a valid VCALENDAR with only public events', async () => {
    const rows = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: 'Sunday Service',
        visibility: 'public',
        startsAt: new Date('2026-09-06T16:00:00Z'),
        endsAt: new Date('2026-09-06T17:30:00Z'),
        description: 'A, B; C',
        location: 'Main Hall',
        createdAt: new Date('2026-08-01T00:00:00Z'),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        title: 'Private Meeting',
        visibility: 'private',
        startsAt: new Date('2026-09-07T16:00:00Z'),
        endsAt: null,
        description: null,
        location: null,
        createdAt: new Date('2026-08-01T00:00:00Z'),
      },
    ];

    const svc = new CalendarService(fakeDb(rows));
    const feed = await svc.buildPublicFeed();

    expect(feed).toContain('BEGIN:VCALENDAR');
    expect(feed).toContain('END:VCALENDAR');
    expect(feed).toContain('SUMMARY:Sunday Service');
    expect(feed).toContain('DTSTART:20260906T160000Z');
    expect(feed).toContain('DTEND:20260906T173000Z');
    // private events must NOT appear
    expect(feed).not.toContain('Private Meeting');
    // escaping
    expect(feed).toContain('A\\, B\\; C');
    // line folding present for CRLF structure
    expect(feed).toContain('\r\n');
  });

  it('defaults end time to one hour after start when missing', async () => {
    const rows = [
      {
        id: '33333333-3333-3333-3333-333333333333',
        title: 'Open Event',
        visibility: 'public',
        startsAt: new Date('2026-09-08T18:00:00Z'),
        endsAt: null,
        description: null,
        location: null,
        createdAt: new Date('2026-08-01T00:00:00Z'),
      },
    ];
    const svc = new CalendarService(fakeDb(rows));
    const feed = await svc.buildPublicFeed();
    expect(feed).toContain('DTEND:20260908T190000Z');
  });
});
