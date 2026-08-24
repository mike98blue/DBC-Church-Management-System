import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { careCases, careNotes, prayerRequests } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class CareService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  // Prayer — separate from generic person search, visibility enforced
  async createPrayer(dto: { personId: string; request: string; visibility?: string }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(prayerRequests)
      .values({
        personId: dto.personId,
        request: dto.request,
        visibility: (dto.visibility as never) ?? 'private',
      })
      .returning();
    if (!row) throw new Error('Failed to create prayer');
    return row;
  }

  async listPrayers(actorCanSeePastoralOnly: boolean) {
    const db = this.requireDb();
    const rows = await db.select().from(prayerRequests);
    if (actorCanSeePastoralOnly) return rows;
    return rows.filter((r) => r.visibility !== 'pastoral_only');
  }

  // Care — Highly Restricted, never returned from people/households/events endpoints
  async createCase(dto: { personId: string; title: string }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(careCases)
      .values({ personId: dto.personId, title: dto.title })
      .returning();
    if (!row) throw new Error('Failed to create case');
    return row;
  }

  async getCase(id: string) {
    const db = this.requireDb();
    const [row] = await db.select().from(careCases).where(eq(careCases.id, id)).limit(1);
    if (!row) throw new NotFoundException('Care case not found');
    const notes = await db.select().from(careNotes).where(eq(careNotes.careCaseId, id));
    return { ...row, notes };
  }

  async addNote(caseId: string, authorId: string | null, note: string) {
    const db = this.requireDb();
    await this.getCase(caseId);
    const [row] = await db
      .insert(careNotes)
      .values({ careCaseId: caseId, authorId, note })
      .returning();
    if (!row) throw new Error('Failed to add note');
    return row;
  }
}
