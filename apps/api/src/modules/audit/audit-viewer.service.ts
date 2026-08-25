import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { auditEvents } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class AuditViewerService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async list(params: {
    resourceType?: string;
    actorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: (typeof auditEvents.$inferSelect)[] }> {
    const db = this.requireDb();
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const offset = Math.max(params.offset ?? 0, 0);

    const conditions: SQL[] = [];
    if (params.resourceType) conditions.push(eq(auditEvents.resourceType, params.resourceType));
    if (params.actorId) conditions.push(eq(auditEvents.actorId, params.actorId));

    const base = db.select().from(auditEvents);
    const rows =
      conditions.length === 1
        ? await base
            .where(conditions[0])
            .orderBy(desc(auditEvents.createdAt))
            .limit(limit)
            .offset(offset)
        : conditions.length > 1
          ? await base
              .where(and(...conditions))
              .orderBy(desc(auditEvents.createdAt))
              .limit(limit)
              .offset(offset)
          : await base.orderBy(desc(auditEvents.createdAt)).limit(limit).offset(offset);

    return { data: rows };
  }
}
