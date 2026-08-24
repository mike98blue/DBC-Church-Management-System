import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import { facilities, reservations, rooms } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class FacilityService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async createFacility(dto: { name: string; campus?: string; address?: string }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(facilities)
      .values({ name: dto.name, campus: dto.campus ?? null, address: dto.address ?? null })
      .returning();
    if (!row) throw new Error('Failed to create facility');
    return row;
  }

  async listFacilities() {
    const db = this.requireDb();
    return db.select().from(facilities).orderBy(asc(facilities.name));
  }

  async createRoom(dto: { facilityId?: string; name: string; capacity?: number }) {
    const db = this.requireDb();
    const [row] = await db
      .insert(rooms)
      .values({
        facilityId: dto.facilityId ?? null,
        name: dto.name,
        capacity: dto.capacity ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create room');
    return row;
  }

  async listRooms() {
    const db = this.requireDb();
    return db.select().from(rooms).orderBy(asc(rooms.name));
  }

  async createReservation(dto: {
    roomId: string;
    title: string;
    startsAt: string;
    endsAt: string;
    createdBy?: string | null;
  }) {
    const db = this.requireDb();
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt) throw new BadRequestException('endsAt must be after startsAt');

    // Check for overlapping reservations in the same room
    const overlapping = await db.execute(
      sql`SELECT 1 FROM reservations WHERE room_id = ${dto.roomId} AND tstzrange(starts_at, ends_at) && tstzrange(${startsAt.toISOString()}::timestamptz, ${endsAt.toISOString()}::timestamptz) LIMIT 1`,
    );
    if ((overlapping.rows as unknown[]).length > 0) {
      throw new BadRequestException('Room already reserved for that time');
    }

    const [row] = await db
      .insert(reservations)
      .values({
        roomId: dto.roomId,
        title: dto.title,
        startsAt,
        endsAt,
        createdBy: dto.createdBy ?? null,
      })
      .returning();
    if (!row) throw new Error('Failed to create reservation');
    return row;
  }

  async listReservations(roomId?: string) {
    const db = this.requireDb();
    if (roomId) {
      return db
        .select()
        .from(reservations)
        .where(eq(reservations.roomId, roomId))
        .orderBy(asc(reservations.startsAt));
    }
    return db.select().from(reservations).orderBy(asc(reservations.startsAt));
  }
}
