import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  contributionAllocations,
  contributions,
  donors,
  funds,
  paymentProviderTransactions,
  people,
} from '@churchos/db';
import type { Database } from '@churchos/db';
import { stripeAdapter } from './stripe.adapter.js';

@Injectable()
export class GivingService {
  constructor(@Inject('DATABASE') private readonly db: Database | null) {}

  private requireDb(): NonNullable<Database> {
    if (!this.db) throw new Error('DATABASE_URL is not configured');
    return this.db as NonNullable<Database>;
  }

  // Funds — G-01
  async listFunds(): Promise<(typeof funds.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(funds);
  }

  async createFund(name: string, description?: string): Promise<typeof funds.$inferSelect> {
    const db = this.requireDb();
    const [fund] = await db
      .insert(funds)
      .values({ name, description: description ?? null })
      .returning();
    if (!fund) throw new Error('Failed to create fund');
    return fund;
  }

  // Checkout — G-03 (hosted, no raw card data)
  async createCheckoutSession(params: {
    fundId: string;
    amountCents: number;
    currency?: string;
  }): Promise<{ url: string; sessionId: string }> {
    const db = this.requireDb();
    const [fund] = await db.select().from(funds).where(eq(funds.id, params.fundId)).limit(1);
    if (!fund) throw new NotFoundException('Fund not found');
    const session = await stripeAdapter.createCheckoutSession({
      amountCents: params.amountCents,
      currency: params.currency ?? 'usd',
      fundId: params.fundId,
      successUrl: process.env.GIVING_SUCCESS_URL ?? 'https://example.test/giving/success',
      cancelUrl: process.env.GIVING_CANCEL_URL ?? 'https://example.test/giving/cancel',
    });
    return { url: session.url, sessionId: session.id };
  }

  // Webhook — G-04/G-05 (verified, idempotent)
  async handleWebhook(
    rawBody: string,
    signature: string | null,
  ): Promise<{ received: boolean; id: string }> {
    const db = this.requireDb();
    const event = stripeAdapter.verifyWebhook(rawBody, signature);

    // Idempotency: if we have already stored this provider event, return without double-processing
    const [existing] = await db
      .select()
      .from(paymentProviderTransactions)
      .where(eq(paymentProviderTransactions.providerId, event.id))
      .limit(1);
    if (existing) return { received: true, id: event.id };

    const obj = event.data.object as {
      id: string;
      amount_total?: number;
      currency?: string;
      payment_status?: string;
    };
    await db.insert(paymentProviderTransactions).values({
      provider: 'stripe',
      providerId: event.id,
      status: event.type,
      amountCents: obj.amount_total ?? 0,
      currency: obj.currency ?? 'usd',
      rawPayload: rawBody,
    });

    // Only create a contribution on succeeded checkout
    if (event.type === 'checkout.session.completed' && obj.payment_status === 'paid') {
      // For mock, we need a donor — create or find a placeholder donor linked to a synthetic person if needed
      // For now, require a person to exist; use the first person as donor for mock, or skip if none
      const [firstPerson] = await db.select().from(people).limit(1);
      if (firstPerson) {
        let [donor] = await db
          .select()
          .from(donors)
          .where(eq(donors.personId, firstPerson.id))
          .limit(1);
        if (!donor) {
          [donor] = await db.insert(donors).values({ personId: firstPerson.id }).returning();
        }
        if (donor) {
          const [contribution] = await db
            .insert(contributions)
            .values({
              donorId: donor.id,
              amountCents: obj.amount_total ?? 0,
              currency: obj.currency ?? 'usd',
              status: 'succeeded',
              provider: 'stripe',
              providerTransactionId: event.id,
            })
            .returning();
          if (contribution) {
            // Allocate to the first fund for mock; real flow would use metadata from the session
            const [firstFund] = await db.select().from(funds).limit(1);
            if (firstFund) {
              await db.insert(contributionAllocations).values({
                contributionId: contribution.id,
                fundId: firstFund.id,
                amountCents: contribution.amountCents,
              });
            }
          }
        }
      }
    }

    return { received: true, id: event.id };
  }

  async listContributions(): Promise<(typeof contributions.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(contributions);
  }
}
