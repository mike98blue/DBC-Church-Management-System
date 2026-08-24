import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Audit log for sensitive operations (blueprint Sections 9.1, 10.2, 25).
 * Every write to people/households and every finance export must create a record here.
 * Highly Restricted reads (pastoral, giving) should also be logged when that lands.
 */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: text('actor_id'),
    action: text('action').notNull(),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_events_resource_idx').on(table.resourceType, table.resourceId),
    index('audit_events_actor_idx').on(table.actorId),
    index('audit_events_created_at_idx').on(table.createdAt),
  ],
);

export type AuditEventRow = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
