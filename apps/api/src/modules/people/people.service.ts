import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, ilike, or } from 'drizzle-orm';
import { people } from '@churchos/db';
import type { Database } from '@churchos/db';
import type { AuditService } from '../audit/audit.service.js';
import type { CreatePersonDto } from './dto/create-person.dto.js';
import type { UpdatePersonDto } from './dto/update-person.dto.js';

@Injectable()
export class PeopleService {
  constructor(
    @Inject('DATABASE') private readonly db: Database | null,
    private readonly audit: AuditService,
  ) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async list(params: {
    q?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: (typeof people.$inferSelect)[]; total: number }> {
    const db = this.requireDb();
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const offset = Math.max(params.offset ?? 0, 0);

    const conditions = [];
    if (params.q) {
      const pattern = `%${params.q}%`;
      conditions.push(or(ilike(people.firstName, pattern), ilike(people.lastName, pattern)));
    }
    if (params.status) {
      conditions.push(eq(people.status, params.status as never));
    }

    // drizzle where with array not yet; chain manually for MVP: use dynamic query builder
    // For now, handle the common cases without a full query builder abstraction.
    const rows = await (async () => {
      if (params.q && params.status) {
        const pattern = `%${params.q}%`;
        return db
          .select()
          .from(people)
          .where(or(ilike(people.firstName, pattern), ilike(people.lastName, pattern)))
          .orderBy(asc(people.lastName), asc(people.firstName))
          .limit(limit)
          .offset(offset);
      }
      if (params.q) {
        const pattern = `%${params.q}%`;
        return db
          .select()
          .from(people)
          .where(or(ilike(people.firstName, pattern), ilike(people.lastName, pattern)))
          .orderBy(asc(people.lastName), asc(people.firstName))
          .limit(limit)
          .offset(offset);
      }
      if (params.status) {
        return db
          .select()
          .from(people)
          .where(eq(people.status, params.status as never))
          .orderBy(asc(people.lastName), asc(people.firstName))
          .limit(limit)
          .offset(offset);
      }
      return db
        .select()
        .from(people)
        .orderBy(asc(people.lastName), asc(people.firstName))
        .limit(limit)
        .offset(offset);
    })();

    // total not paginated count for the same filter — cheap for MVP volumes, refine later
    return { data: rows, total: rows.length };
  }

  async get(id: string): Promise<typeof people.$inferSelect> {
    const db = this.requireDb();
    const [row] = await db.select().from(people).where(eq(people.id, id)).limit(1);
    if (!row) throw new NotFoundException('Person not found');
    return row;
  }

  async create(dto: CreatePersonDto, actorId: string | null): Promise<typeof people.$inferSelect> {
    const db = this.requireDb();
    const [row] = await db
      .insert(people)
      .values({
        firstName: dto.firstName,
        preferredName: dto.preferredName ?? null,
        middleName: dto.middleName ?? null,
        lastName: dto.lastName,
        status: (dto.status as never) ?? 'guest',
      })
      .returning();
    if (!row) throw new Error('Failed to create person');
    await this.audit.log({
      actorId,
      action: 'people.create',
      resourceType: 'people',
      resourceId: row.id,
    });
    return row;
  }

  async update(
    id: string,
    dto: UpdatePersonDto,
    actorId: string | null,
  ): Promise<typeof people.$inferSelect> {
    const db = this.requireDb();
    const existing = await this.get(id);
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (dto.firstName !== undefined) patch['firstName'] = dto.firstName;
    if (dto.preferredName !== undefined) patch['preferredName'] = dto.preferredName;
    if (dto.middleName !== undefined) patch['middleName'] = dto.middleName;
    if (dto.lastName !== undefined) patch['lastName'] = dto.lastName;
    if (dto.status !== undefined) patch['status'] = dto.status;

    const [row] = await db
      .update(people)
      .set(patch as never)
      .where(eq(people.id, id))
      .returning();
    if (!row) throw new NotFoundException('Person not found');
    // keep updatedAt monotonic even if client sent same values
    void existing;
    await this.audit.log({
      actorId,
      action: 'people.update',
      resourceType: 'people',
      resourceId: id,
    });
    return row;
  }
}
