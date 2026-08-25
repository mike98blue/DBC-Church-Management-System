import { Inject, Injectable } from '@nestjs/common';
import { ilike } from 'drizzle-orm';
import { people } from '@churchos/db';
import type { Database } from '@churchos/db';

export interface DuplicateMatch {
  person: typeof people.$inferSelect;
  reasons: string[];
}

@Injectable()
export class DuplicateService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async findDuplicates(params: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }): Promise<DuplicateMatch[]> {
    const db = this.requireDb();

    // Email and phone would be in person_emails/person_phones tables if they existed (C-02)
    // For now, we match on name (ilike) as the canonical duplicate signal
    const firstName = params.firstName.trim();
    const lastName = params.lastName.trim();
    if (!firstName || !lastName) return [];

    // Fetch by lastName, filter by firstName in JS (acceptable for MVP volumes)
    const candidates = await db.select().from(people).where(ilike(people.lastName, lastName));
    const matches: DuplicateMatch[] = [];

    for (const person of candidates) {
      const reasons: string[] = [];
      if (
        person.firstName.toLowerCase() === firstName.toLowerCase() &&
        person.lastName.toLowerCase() === lastName.toLowerCase()
      ) {
        reasons.push('name');
      }
      // Email/phone matching would go here when C-02 tables land
      if (reasons.length > 0) {
        matches.push({ person, reasons });
      }
    }

    return matches;
  }
}
