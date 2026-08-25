import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { userPersonLinks, users } from '@churchos/db';
import type { Database } from '@churchos/db';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async upsertUser(dto: {
    subject: string;
    email?: string;
    displayName?: string;
    personId?: string;
  }) {
    const db = this.requireDb();
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.externalSubject, dto.subject))
      .limit(1);

    let user = existing;
    if (user) {
      const [updated] = await db
        .update(users)
        .set({
          email: dto.email ?? user.email,
          displayName: dto.displayName ?? user.displayName,
          updatedAt: new Date(),
        } as never)
        .where(eq(users.id, user.id))
        .returning();
      user = updated ?? user;
    } else {
      const [created] = await db
        .insert(users)
        .values({
          externalSubject: dto.subject,
          email: dto.email ?? null,
          displayName: dto.displayName ?? null,
        })
        .returning();
      if (!created) throw new Error('Failed to create user');
      user = created;
    }

    let link = null as typeof userPersonLinks.$inferSelect | null;
    if (dto.personId) {
      const [existingLink] = await db
        .select()
        .from(userPersonLinks)
        .where(eq(userPersonLinks.userId, user.id))
        .limit(1);
      if (existingLink) {
        const [updatedLink] = await db
          .update(userPersonLinks)
          .set({ personId: dto.personId } as never)
          .where(eq(userPersonLinks.id, existingLink.id))
          .returning();
        link = updatedLink ?? existingLink;
      } else {
        const [createdLink] = await db
          .insert(userPersonLinks)
          .values({ userId: user.id, personId: dto.personId })
          .returning();
        link = createdLink ?? null;
      }
    }

    return { user, link };
  }

  async list() {
    const db = this.requireDb();
    return db
      .select()
      .from(users)
      .orderBy(users.createdAt as never);
  }

  async findBySubject(subject: string) {
    const db = this.requireDb();
    const [user] = await db.select().from(users).where(eq(users.externalSubject, subject)).limit(1);
    if (!user) throw new NotFoundException('User not found');
    const [link] = await db
      .select()
      .from(userPersonLinks)
      .where(eq(userPersonLinks.userId, user.id))
      .limit(1);
    return { user, link: link ?? null };
  }
}
