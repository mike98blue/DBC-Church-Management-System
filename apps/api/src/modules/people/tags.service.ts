import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { people, personTags, tags } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class TagsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async createTag(name: string) {
    const db = this.requireDb();
    const [row] = await db.insert(tags).values({ name }).onConflictDoNothing().returning();
    if (row) return row;
    const [existing] = await db.select().from(tags).where(eq(tags.name, name)).limit(1);
    if (!existing) throw new Error('Failed to create tag');
    return existing;
  }

  async listTags() {
    const db = this.requireDb();
    return db.select().from(tags).orderBy(asc(tags.name));
  }

  async tagPerson(personId: string, tagName: string) {
    const db = this.requireDb();
    const [person] = await db.select().from(people).where(eq(people.id, personId)).limit(1);
    if (!person) throw new NotFoundException('Person not found');
    const tag = await this.createTag(tagName);
    const [row] = await db
      .insert(personTags)
      .values({ personId, tagId: tag.id })
      .onConflictDoNothing()
      .returning();
    if (row) return { tag };
    return { tag };
  }

  async untagPerson(personId: string, tagName: string) {
    const db = this.requireDb();
    const [tag] = await db.select().from(tags).where(eq(tags.name, tagName)).limit(1);
    if (!tag) return;
    await db
      .delete(personTags)
      .where(and(eq(personTags.personId, personId), eq(personTags.tagId, tag.id)));
  }

  async listPersonTags(personId: string): Promise<string[]> {
    const db = this.requireDb();
    const rows = await db
      .select({ name: tags.name })
      .from(personTags)
      .innerJoin(tags, eq(personTags.tagId, tags.id))
      .where(eq(personTags.personId, personId))
      .orderBy(asc(tags.name));
    return rows.map((r) => r.name);
  }
}
