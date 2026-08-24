import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { volunteerAssignments, volunteerAvailability } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class SchedulingService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async setAvailability(dto: { personId: string; date: string; status: string; note?: string }) {
    const db = this.requireDb();
    const [existing] = await db
      .select()
      .from(volunteerAvailability)
      .where(
        and(
          eq(volunteerAvailability.personId, dto.personId),
          eq(volunteerAvailability.date, dto.date as never),
        ),
      )
      .limit(1);
    if (existing) {
      const [updated] = await db
        .update(volunteerAvailability)
        .set({ status: dto.status as never, note: dto.note ?? null } as never)
        .where(eq(volunteerAvailability.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(volunteerAvailability)
      .values({
        personId: dto.personId,
        date: dto.date as never,
        status: dto.status as never,
        note: dto.note ?? null,
      })
      .returning();
    if (!created) throw new Error('Failed to set availability');
    return created;
  }

  async listAvailability(personId: string) {
    const db = this.requireDb();
    return db
      .select()
      .from(volunteerAvailability)
      .where(eq(volunteerAvailability.personId, personId))
      .orderBy(asc(volunteerAvailability.date));
  }

  async createAssignment(dto: {
    personId: string;
    groupId?: string;
    eventId?: string;
    role?: string;
    scheduledFor: string;
  }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(volunteerAssignments)
      .values({
        personId: dto.personId,
        groupId: dto.groupId ?? null,
        eventId: dto.eventId ?? null,
        role: dto.role ?? null,
        scheduledFor: dto.scheduledFor as never,
      })
      .returning();
    if (!row) throw new Error('Failed to create assignment');
    return row;
  }

  async listAssignments(personId?: string) {
    const db = this.requireDb();
    if (personId) {
      return db
        .select()
        .from(volunteerAssignments)
        .where(eq(volunteerAssignments.personId, personId))
        .orderBy(asc(volunteerAssignments.scheduledFor));
    }
    return db.select().from(volunteerAssignments).orderBy(asc(volunteerAssignments.scheduledFor));
  }
}
