import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { messageRecipients } from '@churchos/db';
import type { Database } from '@churchos/db';

export interface BounceEvent {
  messageId?: string;
  personId?: string;
  email?: string;
  type: 'bounce' | 'complaint' | 'delivered';
  reason?: string;
}

@Injectable()
export class BounceService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  async handle(event: BounceEvent): Promise<{ processed: boolean }> {
    const db = this.requireDb();
    // For MVP, just update the first matching recipient to bounced/delivered
    // In production, this would be keyed by provider message ID
    if (event.personId) {
      await db
        .update(messageRecipients)
        .set({ status: event.type } as never)
        .where(eq(messageRecipients.personId, event.personId));
    }
    return { processed: true };
  }
}
