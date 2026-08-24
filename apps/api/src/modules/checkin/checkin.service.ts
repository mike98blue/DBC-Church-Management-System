import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { checkins, rooms } from '@churchos/db';
import type { Database } from '@churchos/db';
import { randomInt } from 'crypto';

@Injectable()
export class CheckinService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  private generatePickupCode(): string {
    // 6-digit, not predictable (crypto random), avoid 000000
    return String(randomInt(100000, 999999));
  }

  async checkIn(
    dto: { childPersonId: string; eventId: string; roomId?: string },
    actorId: string | null,
  ) {
    const db = this.requireDb();

    if (dto.roomId) {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, dto.roomId)).limit(1);
      if (!room) throw new NotFoundException('Room not found');
      if (room.capacity !== null) {
        const existing = await db
          .select()
          .from(checkins)
          .where(and(eq(checkins.roomId, dto.roomId), eq(checkins.status, 'checked_in')));
        if (existing.length >= room.capacity) {
          throw new BadRequestException('Room at capacity');
        }
      }
    }

    const pickupCode = this.generatePickupCode();
    const [row] = await db
      .insert(checkins)
      .values({
        childPersonId: dto.childPersonId,
        eventId: dto.eventId,
        roomId: dto.roomId ?? null,
        pickupCode,
        status: 'checked_in',
        checkedInBy: actorId,
      })
      .returning();
    if (!row) throw new Error('Failed to check in');
    return row;
  }

  async checkOut(id: string, pickupCode: string, actorId: string | null) {
    const db = this.requireDb();
    const [existing] = await db.select().from(checkins).where(eq(checkins.id, id)).limit(1);
    if (!existing) throw new NotFoundException('Check-in not found');
    if (existing.pickupCode !== pickupCode) throw new BadRequestException('Invalid pickup code');
    if (existing.status !== 'checked_in') throw new BadRequestException('Already checked out');

    const [updated] = await db
      .update(checkins)
      .set({ status: 'checked_out', checkedOutAt: new Date(), checkedOutBy: actorId } as never)
      .where(eq(checkins.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Check-in not found');
    return updated;
  }

  async roster(eventId: string, roomId?: string) {
    const db = this.requireDb();
    const conditions = [eq(checkins.eventId, eventId), eq(checkins.status, 'checked_in')];
    if (roomId) conditions.push(eq(checkins.roomId, roomId));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    return db
      .select()
      .from(checkins)
      .where(whereClause as never);
  }
}
