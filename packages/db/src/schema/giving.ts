import { index, pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { people } from './people.js';

export const funds = pgTable('funds', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const donors = pgTable('donors', {
  id: uuid('id').defaultRandom().primaryKey(),
  personId: uuid('person_id')
    .notNull()
    .references(() => people.id, { onDelete: 'restrict' })
    .unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contributions = pgTable(
  'contributions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    donorId: uuid('donor_id')
      .notNull()
      .references(() => donors.id, { onDelete: 'restrict' }),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('usd'),
    status: text('status').notNull().default('pending'),
    provider: text('provider').notNull().default('stripe'),
    providerTransactionId: text('provider_transaction_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('contributions_donor_idx').on(table.donorId)],
);

export const contributionAllocations = pgTable(
  'contribution_allocations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contributionId: uuid('contribution_id')
      .notNull()
      .references(() => contributions.id, { onDelete: 'cascade' }),
    fundId: uuid('fund_id')
      .notNull()
      .references(() => funds.id, { onDelete: 'restrict' }),
    amountCents: integer('amount_cents').notNull(),
  },
  (table) => [index('allocations_contribution_idx').on(table.contributionId)],
);

export const paymentProviderTransactions = pgTable(
  'payment_provider_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    provider: text('provider').notNull().default('stripe'),
    providerId: text('provider_id').notNull().unique(),
    status: text('status').notNull(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull(),
    rawPayload: text('raw_payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('ppt_provider_id_idx').on(table.providerId)],
);

export type FundRow = typeof funds.$inferSelect;
export type ContributionRow = typeof contributions.$inferSelect;
