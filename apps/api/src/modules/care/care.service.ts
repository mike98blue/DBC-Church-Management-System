import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { careCases, careNotes, prayerRequests } from '@churchos/db';
import type { Database } from '@churchos/db';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class CareService {
  constructor(
    @Inject('DATABASE') private readonly db: Database | null,
    private readonly audit: AuditService,
  ) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async createPrayer(
    dto: { personId: string; request: string; visibility?: string },
    actorId: string | null,
  ) {
    const db = this.requireDb();
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(prayerRequests)
        .values({
          personId: dto.personId,
          request: dto.request,
          visibility: (dto.visibility as never) ?? 'private',
        })
        .returning();
      if (!row) throw new Error('Failed to create prayer');
      await this.audit.logInTx(tx as unknown as Database, {
        actorId,
        action: 'prayer.created',
        resourceType: 'prayer_request',
        resourceId: row.id,
      });
      return row;
    });
  }

  async listPrayers(actorCanSeePastoralOnly: boolean) {
    const db = this.requireDb();
    const rows = await db.select().from(prayerRequests);
    if (actorCanSeePastoralOnly) return rows;
    return rows.filter((r) => r.visibility !== 'pastoral_only');
  }

  async createCase(dto: { personId: string; title: string }, actorId: string | null) {
    const db = this.requireDb();
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(careCases)
        .values({ personId: dto.personId, title: dto.title })
        .returning();
      if (!row) throw new Error('Failed to create case');
      await this.audit.logInTx(tx as unknown as Database, {
        actorId,
        action: 'care.created',
        resourceType: 'care_case',
        resourceId: row.id,
      });
      return row;
    });
  }

  async getCase(id: string, actorId: string | null = null) {
    const db = this.requireDb();
    const [row] = await db.select().from(careCases).where(eq(careCases.id, id)).limit(1);
    if (!row) throw new NotFoundException('Care case not found');
    const notes = await db.select().from(careNotes).where(eq(careNotes.careCaseId, id));
    await this.audit.log({
      actorId,
      action: 'care.read',
      resourceType: 'care_case',
      resourceId: id,
    });
    return { ...row, notes };
  }

  async addNote(caseId: string, authorId: string | null, note: string) {
    const db = this.requireDb();
    return db.transaction(async (tx) => {
      const [existing] = await tx.select().from(careCases).where(eq(careCases.id, caseId)).limit(1);
      if (!existing) throw new NotFoundException('Care case not found');
      const [row] = await tx
        .insert(careNotes)
        .values({ careCaseId: caseId, authorId, note })
        .returning();
      if (!row) throw new Error('Failed to add note');
      await this.audit.logInTx(tx as unknown as Database, {
        actorId: authorId,
        action: 'care.note_created',
        resourceType: 'care_case',
        resourceId: caseId,
      });
      return row;
    });
  }
}
