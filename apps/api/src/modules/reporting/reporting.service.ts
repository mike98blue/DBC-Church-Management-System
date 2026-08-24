import { Inject, Injectable } from '@nestjs/common';
import { count, sql } from 'drizzle-orm';
import { contributions, people } from '@churchos/db';
import type { Database } from '@churchos/db';
import type { AuditService } from '../audit/audit.service.js';

@Injectable()
export class ReportingService {
  constructor(
    @Inject('DATABASE') private readonly db: Database | null,
    private readonly audit: AuditService,
  ) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async peopleCounts(): Promise<Record<string, number>> {
    const db = this.requireDb();
    const rows = await db
      .select({ status: people.status, value: count() })
      .from(people)
      .groupBy(people.status);
    const result: Record<string, number> = {};
    for (const r of rows) result[r.status] = r.value;
    return result;
  }

  async givingByFund(): Promise<{ fundId: string; totalCents: number }[]> {
    const db = this.requireDb();
    // Simplified: sum contributions via allocations
    const rows = await db.execute(
      sql`SELECT fund_id as "fundId", SUM(amount_cents) as "totalCents" FROM contribution_allocations GROUP BY fund_id`,
    );
    return rows.rows as { fundId: string; totalCents: number }[];
  }

  async exportPeopleCsv(actorId: string | null): Promise<string> {
    const db = this.requireDb();
    const rows = await db.select().from(people);
    await this.audit.log({
      actorId,
      action: 'people.export',
      resourceType: 'people',
      metadata: { count: rows.length },
    });
    const header = 'id,firstName,lastName,status';
    const lines = rows.map((r) => `${r.id},${r.firstName},${r.lastName},${r.status}`);
    return [header, ...lines].join('\n');
  }

  async exportGivingCsv(actorId: string | null): Promise<string> {
    const db = this.requireDb();
    const rows = await db.select().from(contributions);
    await this.audit.log({
      actorId,
      action: 'giving.export',
      resourceType: 'contributions',
      metadata: { count: rows.length },
    });
    const header = 'id,donorId,amountCents,currency,status';
    const lines = rows.map(
      (r) => `${r.id},${r.donorId},${r.amountCents},${r.currency},${r.status}`,
    );
    return [header, ...lines].join('\n');
  }
}
