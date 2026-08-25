import { Inject, Injectable } from '@nestjs/common';
import { count, sql } from 'drizzle-orm';
import { contributions, events, people } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class DashboardService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async summary(): Promise<{
    totalPeople: number;
    upcomingEvents: number;
    totalGivingCents: number;
  }> {
    const db = this.requireDb();
    const [peopleCount] = await db.select({ value: count() }).from(people);
    const [eventCount] = await db
      .select({ value: count() })
      .from(events)
      .where(sql`${events.startsAt} > now()`);
    const [givingTotal] = await db
      .select({ value: sql<number>`COALESCE(SUM(${contributions.amountCents}), 0)` })
      .from(contributions);

    return {
      totalPeople: peopleCount?.value ?? 0,
      upcomingEvents: eventCount?.value ?? 0,
      totalGivingCents: givingTotal?.value ?? 0,
    };
  }
}
