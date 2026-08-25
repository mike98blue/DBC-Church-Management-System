import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { customFieldDefinitions, customFieldValues, people } from '@churchos/db';
import type { Database } from '@churchos/db';

const VALID_TYPES = ['text', 'number', 'date', 'boolean', 'select'] as const;

@Injectable()
export class CustomFieldsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async createDefinition(dto: { key: string; label: string; type: string; options?: string }) {
    const db = this.requireDb();
    if (!VALID_TYPES.includes(dto.type as (typeof VALID_TYPES)[number])) {
      throw new BadRequestException('Invalid field type');
    }
    if (dto.type === 'select' && !dto.options) {
      throw new BadRequestException('select fields require options');
    }
    const [row] = await db
      .insert(customFieldDefinitions)
      .values({
        key: dto.key,
        label: dto.label,
        type: dto.type as never,
        options: dto.options ?? null,
      })
      .onConflictDoNothing()
      .returning();
    if (row) return row;
    const [existing] = await db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.key, dto.key))
      .limit(1);
    if (!existing) throw new Error('Failed to create field definition');
    return existing;
  }

  async listDefinitions() {
    const db = this.requireDb();
    return db.select().from(customFieldDefinitions).orderBy(asc(customFieldDefinitions.key));
  }

  async setValue(personId: string, key: string, value: string | undefined) {
    const db = this.requireDb();
    const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1);
    if (!person) throw new NotFoundException('Person not found');
    const [def] = await db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.key, key))
      .limit(1);
    if (!def) throw new NotFoundException('Unknown field key');

    // Basic type validation
    if (value !== undefined && value !== '') {
      if (def.type === 'number' && Number.isNaN(Number(value))) {
        throw new BadRequestException('Value must be a number');
      }
      if (def.type === 'boolean' && !['true', 'false'].includes(value)) {
        throw new BadRequestException('Value must be true or false');
      }
      if (def.type === 'date' && Number.isNaN(Date.parse(value))) {
        throw new BadRequestException('Value must be a valid date');
      }
      if (def.type === 'select' && def.options && !def.options.split(',').includes(value)) {
        throw new BadRequestException(`Value must be one of: ${def.options}`);
      }
    }

    // Upsert on (personId, definitionId)
    const [row] = await db
      .insert(customFieldValues)
      .values({ personId, definitionId: def.id, value: value ?? null, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [customFieldValues.personId, customFieldValues.definitionId],
        set: { value: value ?? null, updatedAt: new Date() },
      })
      .returning();
    if (!row) throw new Error('Failed to set field value');
    return row;
  }

  async getPersonValues(personId: string): Promise<Record<string, string | null>> {
    const db = this.requireDb();
    const rows = await db
      .select({ key: customFieldDefinitions.key, value: customFieldValues.value })
      .from(customFieldValues)
      .innerJoin(
        customFieldDefinitions,
        eq(customFieldValues.definitionId, customFieldDefinitions.id),
      )
      .where(eq(customFieldValues.personId, personId))
      .orderBy(asc(customFieldDefinitions.key));
    const out: Record<string, string | null> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  }
}
