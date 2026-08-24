import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { householdMembers, households } from '@churchos/db';
import type { Database } from '@churchos/db';
import type { AuditService } from '../audit/audit.service.js';
import type { AddMemberDto } from './dto/add-member.dto.js';
import type { CreateHouseholdDto } from './dto/create-household.dto.js';

@Injectable()
export class HouseholdsService {
  constructor(
    @Inject('DATABASE') private readonly db: Database | null,
    private readonly audit: AuditService,
  ) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async list(): Promise<(typeof households.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(households).orderBy(asc(households.name));
  }

  async get(id: string): Promise<{
    household: typeof households.$inferSelect;
    members: (typeof householdMembers.$inferSelect)[];
  }> {
    const db = this.requireDb();
    const [household] = await db.select().from(households).where(eq(households.id, id)).limit(1);
    if (!household) throw new NotFoundException('Household not found');
    const members = await db
      .select()
      .from(householdMembers)
      .where(eq(householdMembers.householdId, id));
    return { household, members };
  }

  async create(
    dto: CreateHouseholdDto,
    actorId: string | null,
  ): Promise<typeof households.$inferSelect> {
    const db = this.requireDb();
    const [household] = await db.insert(households).values({ name: dto.name }).returning();
    if (!household) throw new Error('Failed to create household');
    if (dto.memberIds?.length) {
      await db.insert(householdMembers).values(
        dto.memberIds.map((personId) => ({
          householdId: household.id,
          personId,
          role: 'other' as const,
        })),
      );
    }
    await this.audit.log({
      actorId,
      action: 'households.create',
      resourceType: 'households',
      resourceId: household.id,
    });
    return household;
  }

  async addMember(
    householdId: string,
    dto: AddMemberDto,
    actorId: string | null,
  ): Promise<typeof householdMembers.$inferSelect> {
    const db = this.requireDb();
    // verify household exists
    await this.get(householdId);
    const [member] = await db
      .insert(householdMembers)
      .values({ householdId, personId: dto.personId, role: dto.role as never })
      .returning();
    if (!member) throw new Error('Failed to add member');
    await this.audit.log({
      actorId,
      action: 'households.add_member',
      resourceType: 'households',
      resourceId: householdId,
      metadata: { personId: dto.personId, role: dto.role },
    });
    return member;
  }

  async removeMember(householdId: string, personId: string, actorId: string | null): Promise<void> {
    const db = this.requireDb();
    await db
      .delete(householdMembers)
      .where(
        and(eq(householdMembers.householdId, householdId), eq(householdMembers.personId, personId)),
      );
    await this.audit.log({
      actorId,
      action: 'households.remove_member',
      resourceType: 'households',
      resourceId: householdId,
      metadata: { personId },
    });
  }
}
