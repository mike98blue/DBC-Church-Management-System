import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { asc, count, eq } from 'drizzle-orm';
import { eventAttendance, eventRegistrations, events } from '@churchos/db';
import type { Database } from '@churchos/db';
import { expandRecurrence, parseRecurrenceRule } from './recurrence.js';
import type { CreateEventDto } from './dto/create-event.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

export interface EventOccurrence {
  eventId: string;
  title: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
}

@Injectable()
export class EventsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async listPublic(): Promise<(typeof events.$inferSelect)[]> {
    const db = this.requireDb();
    return db
      .select()
      .from(events)
      .where(eq(events.visibility, 'public'))
      .orderBy(asc(events.startsAt));
  }

  /**
   * E-02: expand recurring public events into concrete occurrences within
   * the next `horizonDays` (default 90). Non-recurring events appear once.
   */
  async listPublicOccurrences(horizonDays = 90): Promise<EventOccurrence[]> {
    const db = this.requireDb();
    const rows = await db
      .select()
      .from(events)
      .where(eq(events.visibility, 'public'))
      .orderBy(asc(events.startsAt));

    const now = new Date();
    const windowStart = now;
    const windowEnd = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);
    const out: EventOccurrence[] = [];

    for (const event of rows) {
      const rule = parseRecurrenceRule(event.recurrenceRule);
      const defaultDurationMs = 60 * 60 * 1000;
      const duration = event.endsAt
        ? event.endsAt.getTime() - event.startsAt.getTime()
        : defaultDurationMs;

      if (!rule) {
        if (event.startsAt >= windowStart && event.startsAt < windowEnd) {
          out.push({
            eventId: event.id,
            title: event.title,
            location: event.location,
            startsAt: event.startsAt,
            endsAt: event.endsAt ?? new Date(event.startsAt.getTime() + defaultDurationMs),
          });
        }
        continue;
      }

      const starts = expandRecurrence(
        rule,
        event.startsAt,
        windowStart,
        windowEnd,
        event.recurrenceEndsAt,
      );
      for (const startsAt of starts) {
        out.push({
          eventId: event.id,
          title: event.title,
          location: event.location,
          startsAt,
          endsAt: new Date(startsAt.getTime() + duration),
        });
      }
    }

    return out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }

  async listAll(): Promise<(typeof events.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(events).orderBy(asc(events.startsAt));
  }

  async get(id: string): Promise<typeof events.$inferSelect> {
    const db = this.requireDb();
    const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!row) throw new NotFoundException('Event not found');
    return row;
  }

  async create(dto: CreateEventDto): Promise<typeof events.$inferSelect> {
    const db = this.requireDb();
    if (dto.recurrenceRule && !parseRecurrenceRule(dto.recurrenceRule)) {
      throw new BadRequestException('Invalid recurrenceRule');
    }
    const [row] = await db
      .insert(events)
      .values({
        title: dto.title,
        description: dto.description ?? null,
        visibility: (dto.visibility as never) ?? 'public',
        capacity: dto.capacity ?? null,
        location: dto.location ?? null,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        recurrenceRule: dto.recurrenceRule ?? null,
        recurrenceEndsAt: dto.recurrenceEndsAt ? new Date(dto.recurrenceEndsAt) : null,
      })
      .returning();
    if (!row) throw new Error('Failed to create event');
    return row;
  }

  async register(
    eventId: string,
    dto: RegisterDto,
  ): Promise<typeof eventRegistrations.$inferSelect> {
    const db = this.requireDb();
    const event = await this.get(eventId);

    if (event.capacity !== null) {
      const [result] = await db
        .select({ value: count() })
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId));
      const registered = result?.value ?? 0;
      if (registered >= event.capacity) {
        throw new BadRequestException('Event at capacity');
      }
    }

    if (!dto.personId && !dto.guestName) {
      throw new BadRequestException('personId or guestName is required');
    }

    const [row] = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        personId: dto.personId ?? null,
        guestName: dto.guestName ?? null,
        guestEmail: dto.guestEmail ?? null,
        status: 'registered',
      })
      .returning();
    if (!row) throw new Error('Failed to register');
    return row;
  }

  async listRegistrations(eventId: string): Promise<(typeof eventRegistrations.$inferSelect)[]> {
    const db = this.requireDb();
    await this.get(eventId);
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async recordAttendance(
    eventId: string,
    personId: string,
    actorId: string | null,
  ): Promise<typeof eventAttendance.$inferSelect> {
    const db = this.requireDb();
    await this.get(eventId);
    const [row] = await db
      .insert(eventAttendance)
      .values({ eventId, personId, recordedBy: actorId })
      .returning();
    if (!row) throw new Error('Failed to record attendance');
    return row;
  }

  async listAttendance(eventId: string): Promise<(typeof eventAttendance.$inferSelect)[]> {
    const db = this.requireDb();
    await this.get(eventId);
    return db.select().from(eventAttendance).where(eq(eventAttendance.eventId, eventId));
  }
}
