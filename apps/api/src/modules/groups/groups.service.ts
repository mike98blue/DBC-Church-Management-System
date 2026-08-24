import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { groupMembers, groups } from '@churchos/db';
import type { Database } from '@churchos/db';
import type { AddGroupMemberDto } from './dto/add-member.dto.js';
import type { CreateGroupDto } from './dto/create-group.dto.js';

@Injectable()
export class GroupsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async list(): Promise<(typeof groups.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(groups).orderBy(asc(groups.name));
  }

  async get(
    id: string,
  ): Promise<{ group: typeof groups.$inferSelect; members: (typeof groupMembers.$inferSelect)[] }> {
    const db = this.requireDb();
    const [group] = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    if (!group) throw new NotFoundException('Group not found');
    const members = await db.select().from(groupMembers).where(eq(groupMembers.groupId, id));
    return { group, members };
  }

  async create(dto: CreateGroupDto): Promise<typeof groups.$inferSelect> {
    const db = this.requireDb();
    const [group] = await db
      .insert(groups)
      .values({
        name: dto.name,
        description: dto.description ?? null,
        type: (dto.type as never) ?? 'other',
        visibility: (dto.visibility as never) ?? 'private',
        capacity: dto.capacity ?? null,
      })
      .returning();
    if (!group) throw new Error('Failed to create group');
    return group;
  }

  async addMember(
    groupId: string,
    dto: AddGroupMemberDto,
  ): Promise<typeof groupMembers.$inferSelect> {
    const db = this.requireDb();
    await this.get(groupId);
    const [member] = await db
      .insert(groupMembers)
      .values({ groupId, personId: dto.personId, role: dto.role ?? 'member' })
      .returning();
    if (!member) throw new Error('Failed to add member');
    return member;
  }

  async removeMember(groupId: string, personId: string): Promise<void> {
    const db = this.requireDb();
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.personId, personId)));
  }
}
