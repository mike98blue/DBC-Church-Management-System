import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { checkins, events, householdMembers, people, rooms } from '@churchos/db';
import type { Database } from '@churchos/db';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { hasScope, type Actor, PERMISSIONS } from '@churchos/auth';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class CheckinService {
  constructor(
    @Inject('DATABASE') private readonly db: Database | null,
    private readonly audit: AuditService,
  ) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  private generatePickupCode(): string {
    return String(randomInt(100000, 999999));
  }

  private hashPickupCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private verifyPickupCode(stored: string, supplied: string): boolean {
    const storedHash = stored.length === 64 ? stored : this.hashPickupCode(stored);
    const suppliedHash = this.hashPickupCode(supplied);
    if (storedHash.length !== suppliedHash.length) return false;
    return timingSafeEqual(Buffer.from(storedHash), Buffer.from(suppliedHash));
  }

  private async assertHouseholdAccess(actor: Actor, childPersonId: string): Promise<void> {
    if (hasScope(actor, PERMISSIONS.CHECKIN_OPERATE, 'organization')) return;
    if (actor.permissions.includes(PERMISSIONS.CHECKIN_ADMIN)) return;
    if (!actor.personId) {
      throw new ForbiddenException('Actor not linked to a person record');
    }
    const db = this.requireDb();
    const childHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(eq(householdMembers.personId, childPersonId));
    if (childHouseholds.length === 0) {
      throw new ForbiddenException('Child has no household — admin required');
    }
    const childHouseholdIds = childHouseholds.map((r) => r.householdId);
    const actorHouseholds = await db
      .select({ householdId: householdMembers.householdId })
      .from(householdMembers)
      .where(
        and(
          eq(householdMembers.personId, actor.personId),
          inArray(householdMembers.householdId, childHouseholdIds),
        ),
      )
      .limit(1);
    if (actorHouseholds.length === 0) {
      throw new ForbiddenException('Not authorized for this child — not in same household');
    }
  }

  async checkIn(
    dto: { childPersonId: string; eventId: string; roomId?: string },
    actor: Actor | null,
  ) {
    if (!actor) throw new ForbiddenException('Authentication required');
    await this.assertHouseholdAccess(actor, dto.childPersonId);
    const db = this.requireDb();
    const [child] = await db
      .select({ id: people.id })
      .from(people)
      .where(eq(people.id, dto.childPersonId))
      .limit(1);
    if (!child) throw new NotFoundException('Child not found');
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, dto.eventId))
      .limit(1);
    if (!event) throw new NotFoundException('Event not found');

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
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(checkins)
        .values({
          childPersonId: dto.childPersonId,
          eventId: dto.eventId,
          roomId: dto.roomId ?? null,
          pickupCode: this.hashPickupCode(pickupCode),
          status: 'checked_in',
          checkedInBy: actor.id,
        })
        .returning();
      if (!row) throw new Error('Failed to check in');
      await this.audit.logInTx(tx as unknown as Database, {
        actorId: actor.id,
        action: 'checkin.created',
        resourceType: 'checkin',
        resourceId: row.id,
        metadata: { childPersonId: dto.childPersonId, eventId: dto.eventId },
      });
      return { ...row, pickupCode };
    });
  }

  async checkOut(id: string, pickupCode: string, actor: Actor | null) {
    if (!actor) throw new ForbiddenException('Authentication required');
    const db = this.requireDb();
    const [existing] = await db.select().from(checkins).where(eq(checkins.id, id)).limit(1);
    if (!existing) throw new NotFoundException('Check-in not found');
    await this.assertHouseholdAccess(actor, existing.childPersonId);
    if (!this.verifyPickupCode(existing.pickupCode, pickupCode))
      throw new BadRequestException('Invalid pickup code');
    if (existing.status !== 'checked_in') throw new BadRequestException('Already checked out');

    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(checkins)
        .set({ status: 'checked_out', checkedOutAt: new Date(), checkedOutBy: actor.id } as never)
        .where(eq(checkins.id, id))
        .returning();
      if (!updated) throw new NotFoundException('Check-in not found');
      await this.audit.logInTx(tx as unknown as Database, {
        actorId: actor.id,
        action: 'checkin.checked_out',
        resourceType: 'checkin',
        resourceId: id,
      });
      return updated;
    });
  }

  async roster(eventId: string, roomId?: string) {
    const db = this.requireDb();
    const conditions = [eq(checkins.eventId, eventId), eq(checkins.status, 'checked_in')];
    if (roomId) conditions.push(eq(checkins.roomId, roomId));
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    return db
      .select({
        id: checkins.id,
        childPersonId: checkins.childPersonId,
        eventId: checkins.eventId,
        roomId: checkins.roomId,
        status: checkins.status,
        checkedInBy: checkins.checkedInBy,
        checkedInAt: checkins.checkedInAt,
        checkedOutAt: checkins.checkedOutAt,
        checkedOutBy: checkins.checkedOutBy,
      })
      .from(checkins)
      .where(whereClause as never);
  }
}
