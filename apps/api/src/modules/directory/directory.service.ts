import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { directoryPreferences, people } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class DirectoryService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async list(
    q?: string,
  ): Promise<
    (typeof people.$inferSelect & { directory: typeof directoryPreferences.$inferSelect | null })[]
  > {
    const db = this.requireDb();
    const prefs = await db.select().from(directoryPreferences);
    const prefMap = new Map(prefs.map((p) => [p.personId, p]));
    const allPeople = await db.select().from(people);
    const needle = q?.trim().toLowerCase() ?? '';
    // Only those with showInDirectory true, optionally filtered by q
    return allPeople
      .filter((p) => prefMap.get(p.id)?.showInDirectory)
      .filter((p) =>
        needle ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(needle) : true,
      )
      .map((p) => ({ ...p, directory: prefMap.get(p.id) ?? null }))
      .map((p) => {
        const pref = prefMap.get(p.id);
        // Filter fields based on opt-in
        return {
          ...p,
          // In real implementation, these would be joined with contact tables
          // For MVP, we just respect the flags and return null for non-opted fields
          directory: pref ?? null,
        };
      });
  }

  async updatePreferences(
    personId: string,
    dto: {
      showInDirectory?: boolean;
      showEmail?: boolean;
      showPhone?: boolean;
      showAddress?: boolean;
    },
  ) {
    const db = this.requireDb();
    const [existing] = await db
      .select()
      .from(directoryPreferences)
      .where(eq(directoryPreferences.personId, personId))
      .limit(1);
    if (existing) {
      const [updated] = await db
        .update(directoryPreferences)
        .set({
          showInDirectory: dto.showInDirectory ?? existing.showInDirectory,
          showEmail: dto.showEmail ?? existing.showEmail,
          showPhone: dto.showPhone ?? existing.showPhone,
          showAddress: dto.showAddress ?? existing.showAddress,
          updatedAt: new Date(),
        } as never)
        .where(eq(directoryPreferences.personId, personId))
        .returning();
      return updated ?? existing;
    }
    const [created] = await db
      .insert(directoryPreferences)
      .values({
        personId,
        showInDirectory: dto.showInDirectory ?? false,
        showEmail: dto.showEmail ?? false,
        showPhone: dto.showPhone ?? false,
        showAddress: dto.showAddress ?? false,
      })
      .returning();
    if (!created) throw new Error('Failed to create directory preferences');
    return created;
  }

  async getPreferences(personId: string) {
    const db = this.requireDb();
    const [pref] = await db
      .select()
      .from(directoryPreferences)
      .where(eq(directoryPreferences.personId, personId))
      .limit(1);
    return pref ?? null;
  }
}
