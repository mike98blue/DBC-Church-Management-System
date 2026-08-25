import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, between, eq } from 'drizzle-orm';
import { contributionAllocations, contributions, donors, funds, people } from '@churchos/db';
import type { Database } from '@churchos/db';

export interface Statement {
  donorId: string;
  personId: string;
  personName: string;
  period: { start: string; end: string };
  totalCents: number;
  contributions: {
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: string;
    fundAllocations: { fundName: string; amountCents: number }[];
  }[];
}

@Injectable()
export class StatementsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async generate(donorId: string, startDate: string, endDate: string): Promise<Statement> {
    const db = this.requireDb();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new NotFoundException('Invalid date range');
    }

    const [donor] = await db.select().from(donors).where(eq(donors.id, donorId)).limit(1);
    if (!donor) throw new NotFoundException('Donor not found');
    const [person] = await db.select().from(people).where(eq(people.id, donor.personId)).limit(1);
    if (!person) throw new NotFoundException('Person not found for donor');

    const contribs = await db
      .select()
      .from(contributions)
      .where(and(eq(contributions.donorId, donorId), between(contributions.createdAt, start, end)))
      .orderBy(asc(contributions.createdAt));

    const allocations = contribs.length
      ? await db
          .select()
          .from(contributionAllocations)
          .where(and(eq(contributionAllocations.contributionId, contribs[0]!.id)))
      : [];
    // For MVP, fetch allocations per contribution (N+1 acceptable)
    const fundMap = new Map((await db.select().from(funds)).map((f) => [f.id, f.name]));

    const contributionsWithAllocations = await Promise.all(
      contribs.map(async (c) => {
        const allocs = await db
          .select()
          .from(contributionAllocations)
          .where(eq(contributionAllocations.contributionId, c.id));
        return {
          id: c.id,
          amountCents: c.amountCents,
          currency: c.currency,
          status: c.status,
          createdAt: c.createdAt.toISOString(),
          fundAllocations: allocs.map((a) => ({
            fundName: fundMap.get(a.fundId) ?? a.fundId,
            amountCents: a.amountCents,
          })),
        };
      }),
    );

    const totalCents = contribs.reduce((sum, c) => sum + c.amountCents, 0);

    void allocations;

    return {
      donorId,
      personId: donor.personId,
      personName: `${person.firstName} ${person.lastName}`,
      period: { start: start.toISOString(), end: end.toISOString() },
      totalCents,
      contributions: contributionsWithAllocations,
    };
  }
}
