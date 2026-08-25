import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { backgroundChecks, people } from '@churchos/db';
import type { Database } from '@churchos/db';
import { backgroundCheckAdapter } from './background-check.adapter.js';

@Injectable()
export class BackgroundChecksService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async requestCheck(personId: string, actorId: string | null) {
    const db = this.requireDb();
    const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1);
    if (!person) throw new NotFoundException('Person not found');

    const result = await backgroundCheckAdapter.requestCheck({
      personId,
      firstName: person.firstName,
      lastName: person.lastName,
    });

    const [row] = await db
      .insert(backgroundChecks)
      .values({
        personId,
        provider: 'mock',
        providerReferenceId: result.providerReferenceId,
        status: result.status,
        requestedBy: actorId,
        completedAt: result.status === 'clear' ? new Date() : null,
      })
      .returning();
    if (!row) throw new Error('Failed to record background check');
    return row;
  }

  async list(personId?: string) {
    const db = this.requireDb();
    if (personId) {
      return db.select().from(backgroundChecks).where(eq(backgroundChecks.personId, personId));
    }
    return db.select().from(backgroundChecks).orderBy(asc(backgroundChecks.createdAt));
  }
}
