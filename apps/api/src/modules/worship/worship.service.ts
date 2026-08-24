import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { serviceItems, services, songs } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class WorshipService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async createSong(dto: { title: string; author?: string; key?: string; tempo?: number }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(songs)
      .values({
        title: dto.title,
        author: dto.author ?? null,
        key: dto.key ?? null,
        tempo: dto.tempo ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create song');
    return row;
  }

  async listSongs() {
    const db = this.requireDb();
    return db.select().from(songs).orderBy(asc(songs.title));
  }

  async createService(dto: { title: string; serviceDate: string }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(services)
      .values({ title: dto.title, serviceDate: dto.serviceDate as never })
      .returning();
    if (!row) throw new Error('Failed to create service');
    return row;
  }

  async getService(id: string) {
    const db = this.requireDb();
    const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (!service) throw new NotFoundException('Service not found');
    const items = await db
      .select()
      .from(serviceItems)
      .where(eq(serviceItems.serviceId, id))
      .orderBy(asc(serviceItems.order));
    return { ...service, items };
  }

  async addItem(
    serviceId: string,
    dto: { type: string; songId?: string; title?: string; order: number; durationMinutes?: number },
  ) {
    const db = this.requireDb();
    await this.getService(serviceId);
    const [row] = await db
      .insert(serviceItems)
      .values({
        serviceId,
        type: dto.type,
        songId: dto.songId ?? null,
        title: dto.title ?? null,
        order: dto.order,
        durationMinutes: dto.durationMinutes ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to add item');
    return row;
  }
}
