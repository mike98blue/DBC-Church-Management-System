import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { communicationPreferences } from '@churchos/db';
import type { Database } from '@churchos/db';
import { smsAdapter } from './sms.adapter.js';

@Injectable()
export class SmsService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  async send(to: string, body: string): Promise<{ id: string }> {
    // Respect opt-out: if the recipient has unsubscribed, do not send
    if (this.db) {
      try {
        const db = this.db as NonNullable<Database>;
        // For MVP, we check by personId if `to` looks like a UUID, otherwise skip
        const isUuid = /^[0-9a-f-]{36}$/i.test(to);
        if (isUuid) {
          const [pref] = await db
            .select()
            .from(communicationPreferences)
            .where(eq(communicationPreferences.personId, to))
            .limit(1);
          if (pref && !pref.emailOptIn) {
            return { id: `blocked_${to}` };
          }
        }
      } catch {}
    }
    return smsAdapter.send({ to, body });
  }
}
