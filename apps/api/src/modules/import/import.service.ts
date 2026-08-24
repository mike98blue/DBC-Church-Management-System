import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { people } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class ImportService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async previewPeopleCsv(csv: string): Promise<{ total: number; valid: number; duplicates: number; errors: string[] }> {
    const db = this.requireDb();
    const lines = csv.trim().split('\n');
    if (lines.length < 2) throw new BadRequestException('CSV must have header and at least one row');
    const header = lines[0]?.toLowerCase() ?? '';
    if (!header.includes('firstname') || !header.includes('lastname')) {
      throw new BadRequestException('CSV header must include firstName and lastName');
    }

    const rows = lines.slice(1);
    const errors: string[] = [];
    let duplicates = 0;

    const existing = await db.select().from(people);
    const existingSet = new Set(existing.map((p) => `${p.firstName.toLowerCase()}|${p.lastName.toLowerCase()}`));

    for (let i = 0; i < rows.length; i++) {
      const cols = rows[i]?.split(',') ?? [];
      if (cols.length < 2) errors.push(`Row ${i + 2}: not enough columns`);
      const key = `${(cols[0] ?? '').trim().toLowerCase()}|${(cols[1] ?? '').trim().toLowerCase()}`;
      if (existingSet.has(key)) duplicates++;
    }

    return { total: rows.length, valid: rows.length - errors.length, duplicates, errors };
  }
}
