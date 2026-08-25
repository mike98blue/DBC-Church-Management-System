import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  communicationPreferences,
  groupMembers,
  messageRecipients,
  messages,
  people,
  templates,
} from '@churchos/db';
import type { Database } from '@churchos/db';
import { emailProvider } from './email.provider.js';
import type { SendGroupEmailDto } from './dto/send-group-email.dto.js';

function renderTemplate(template: string, variables: Record<string, string> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`);
}

@Injectable()
export class CommunicationsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async sendGroupEmail(
    dto: SendGroupEmailDto,
    actorId: string | null,
  ): Promise<typeof messages.$inferSelect> {
    const db = this.requireDb();

    let subject = dto.subject;
    let body = dto.body;
    let templateId: string | null = null;

    if (dto.templateId) {
      const [template] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, dto.templateId))
        .limit(1);
      if (template) {
        subject = renderTemplate(template.subject, dto.variables);
        body = renderTemplate(template.body, dto.variables);
        templateId = template.id;
      }
    }

    let targetPersonIds: string[] = [];
    if (dto.groupId) {
      const members = await db
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.groupId, dto.groupId));
      targetPersonIds = members.map((m) => m.personId);
    } else if (dto.personIds?.length) {
      targetPersonIds = dto.personIds;
    }

    // Filter by communication preferences (opt-out respected everywhere)
    let filteredIds = targetPersonIds;
    if (targetPersonIds.length) {
      const prefs = await db
        .select()
        .from(communicationPreferences)
        .where(eq(communicationPreferences.emailOptIn, false as never));
      const optedOut = new Set(prefs.map((p) => p.personId));
      filteredIds = targetPersonIds.filter((id) => !optedOut.has(id));
    }

    const [message] = await db
      .insert(messages)
      .values({ subject, body, templateId, createdBy: actorId } as never)
      .returning();
    if (!message) throw new Error('Failed to create message');

    if (filteredIds.length) {
      // Resolve emails — for mock, use stub addresses if people have no email column yet
      const recipients = await db
        .select()
        .from(people)
        .where(eq(people.id, filteredIds[0] as never));
      void recipients;
      await db.insert(messageRecipients).values(
        filteredIds.map((personId) => ({
          messageId: message.id,
          personId,
          status: 'queued',
        })),
      );

      // Mock send — in production this would be queued via a background worker
      for (const personId of filteredIds.slice(0, 10)) {
        await emailProvider.send({
          to: `${personId}@example.test`,
          subject,
          body,
        });
      }
    }

    return message;
  }

  async listTemplates(): Promise<(typeof templates.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(templates);
  }

  async createTemplate(dto: {
    name: string;
    subject: string;
    body: string;
  }): Promise<typeof templates.$inferSelect> {
    const db = this.requireDb();
    const [row] = await db
      .insert(templates)
      .values({ name: dto.name, subject: dto.subject, body: dto.body })
      .returning();
    if (!row) throw new Error('Failed to create template');
    return row;
  }

  async listMessages(): Promise<(typeof messages.$inferSelect)[]> {
    const db = this.requireDb();
    return db
      .select()
      .from(messages)
      .orderBy(messages.createdAt as never);
  }

  async unsubscribe(personId: string): Promise<void> {
    const db = this.requireDb();
    const [existing] = await db
      .select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.personId, personId))
      .limit(1);
    if (existing) {
      await db
        .update(communicationPreferences)
        .set({ emailOptIn: false, unsubscribedAt: new Date() } as never)
        .where(eq(communicationPreferences.personId, personId));
    } else {
      await db
        .insert(communicationPreferences)
        .values({ personId, emailOptIn: false, unsubscribedAt: new Date() });
    }
  }
}
