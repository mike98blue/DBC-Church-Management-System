import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class GivingService {
  constructor(
    @Inject('DATABASE') private readonly db: Database | null,
    private readonly audit: AuditService,
  ) {}

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
    const rootDb = this.requireDb();
    const event = stripeAdapter.verifyWebhook(rawBody, signature);

    return rootDb.transaction(async (db) => {
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
        customer_email?: string;
        metadata?: Record<string, string>;
      };
      try {
        await db.insert(paymentProviderTransactions).values({
          provider: 'stripe',
          providerId: event.id,
          status: event.type,
          amountCents: obj.amount_total ?? 0,
          currency: obj.currency ?? 'usd',
          rawPayload: null,
        });
      } catch (error) {
        if ((error as { code?: string }).code === '23505') return { received: true, id: event.id };
        throw error;
      }

      // Only create a contribution on succeeded checkout
      if (event.type === 'checkout.session.completed' && obj.payment_status === 'paid') {
        let donorPerson: typeof people.$inferSelect | null = null;
        const candidatePersonId = obj.metadata?.['personId'];
        const targetFundId = obj.metadata?.['fundId'];
        if (candidatePersonId) {
          const [found] = await db
            .select()
            .from(people)
            .where(eq(people.id, candidatePersonId))
            .limit(1);
          if (found) donorPerson = found;
        }
        if (!donorPerson && obj.customer_email) {
          void obj.customer_email;
        }

        if (!donorPerson || !targetFundId) {
          await this.audit.logInTx(db as unknown as Database, {
            actorId: null,
            action: 'giving.reconciliation_needed',
            resourceType: 'payment_provider_transactions',
            resourceId: event.id,
            metadata: {
              reason: !donorPerson ? 'missing_donor' : 'missing_fund',
              amountCents: obj.amount_total ?? 0,
              currency: obj.currency ?? 'usd',
              candidatePersonId: candidatePersonId ?? null,
              targetFundId: targetFundId ?? null,
            },
          });
          return { received: true, id: event.id };
        }

        const [foundFund] = await db
          .select({ id: funds.id })
          .from(funds)
          .where(eq(funds.id, targetFundId))
          .limit(1);
        if (!foundFund) {
          await this.audit.logInTx(db as unknown as Database, {
            actorId: null,
            action: 'giving.reconciliation_needed',
            resourceType: 'payment_provider_transactions',
            resourceId: event.id,
            metadata: {
              reason: 'invalid_fund',
              amountCents: obj.amount_total ?? 0,
              targetFundId,
            },
          });
          return { received: true, id: event.id };
        }

        let [donor] = await db
          .select()
          .from(donors)
          .where(eq(donors.personId, donorPerson.id))
          .limit(1);
        if (!donor) {
          [donor] = await db.insert(donors).values({ personId: donorPerson.id }).returning();
        }
        if (!donor) throw new Error('Failed to create donor');

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
        if (!contribution) throw new Error('Failed to create contribution');

        await db.insert(contributionAllocations).values({
          contributionId: contribution.id,
          fundId: targetFundId,
          amountCents: contribution.amountCents,
        });

        await this.audit.logInTx(db as unknown as Database, {
          actorId: null,
          action: 'giving.contribution_created',
          resourceType: 'contributions',
          resourceId: contribution.id,
          metadata: { providerTransactionId: event.id, amountCents: contribution.amountCents },
        });
      }

      return { received: true, id: event.id };
    });
  }

  async listContributions(): Promise<(typeof contributions.$inferSelect)[]> {
    const db = this.requireDb();
    return db.select().from(contributions);
  }

  /**
   * G-10: manual cash/check entry. Records an offline contribution with
   * provider 'manual' and an audit event. Finance permission enforced upstream.
   */
  async createManualEntry(params: {
    donorPersonId: string;
    amountCents: number;
    fundId: string;
    currency?: string;
    method: 'cash' | 'check';
    checkNumber?: string;
    actorId: string | null;
  }): Promise<typeof contributions.$inferSelect> {
    const db = this.requireDb();
    return db.transaction(async (tx) => {
      const [person] = await tx
        .select()
        .from(people)
        .where(eq(people.id, params.donorPersonId))
        .limit(1);
      if (!person) throw new NotFoundException('Donor person not found');
      const [fund] = await tx.select().from(funds).where(eq(funds.id, params.fundId)).limit(1);
      if (!fund) throw new NotFoundException('Fund not found');

      let [donor] = await tx
        .select()
        .from(donors)
        .where(eq(donors.personId, params.donorPersonId))
        .limit(1);
      if (!donor) {
        const [created] = await tx
          .insert(donors)
          .values({ personId: params.donorPersonId })
          .returning();
        if (!created) throw new Error('Failed to create donor');
        donor = created;
      }

      const [contribution] = await tx
        .insert(contributions)
        .values({
          donorId: donor.id,
          amountCents: params.amountCents,
          currency: params.currency ?? 'usd',
          status: 'succeeded',
          provider: 'manual',
          providerTransactionId:
            params.method === 'check' ? `check:${params.checkNumber ?? ''}` : null,
        })
        .returning();
      if (!contribution) throw new Error('Failed to create manual contribution');

      await tx.insert(contributionAllocations).values({
        contributionId: contribution.id,
        fundId: params.fundId,
        amountCents: params.amountCents,
      });

      await this.audit.logInTx(tx as unknown as Database, {
        actorId: params.actorId,
        action: 'giving.manual_entry',
        resourceType: 'contributions',
        resourceId: contribution.id,
        metadata: { amountCents: params.amountCents, method: params.method },
      });

      return contribution;
    });
  }

  /**
   * G-13: refunds/reversals are separate events, never silent edits
   * (blueprint §12 rule 8, .github instructions). Records a negative-amount
   * reversal contribution linked to the original via providerTransactionId.
   */
  async refundContribution(
    contributionId: string,
    _actorId: string | null,
  ): Promise<typeof contributions.$inferSelect> {
    const db = this.requireDb();
    return db.transaction(async (tx) => {
      const [original] = await tx
        .select()
        .from(contributions)
        .where(eq(contributions.id, contributionId))
        .limit(1);
      if (!original) throw new NotFoundException('Contribution not found');
      const [existingRefund] = await tx
        .select()
        .from(contributions)
        .where(eq(contributions.providerTransactionId, `refund:${original.id}`))
        .limit(1);
      if (existingRefund) return existingRefund;
      if (original.status === 'refunded')
        throw new BadRequestException('Contribution already refunded');
      if (original.amountCents < 0) throw new BadRequestException('Cannot refund a reversal');

      const [refund] = await tx
        .insert(contributions)
        .values({
          donorId: original.donorId,
          amountCents: -original.amountCents,
          currency: original.currency,
          status: 'refunded',
          provider: original.provider,
          providerTransactionId: `refund:${original.id}`,
        })
        .returning();
      if (!refund) throw new Error('Failed to record refund');

      await tx
        .update(contributions)
        .set({ status: 'refunded' } as never)
        .where(eq(contributions.id, contributionId));

      await this.audit.logInTx(tx as unknown as Database, {
        actorId: _actorId,
        action: 'giving.refund',
        resourceType: 'contributions',
        resourceId: contributionId,
        metadata: { refundId: refund.id },
      });

      return refund;
    });
  }
}
