import { index, pgTable, text, timestamp, uuid, integer, date } from 'drizzle-orm/pg-core';

export const songs = pgTable('songs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  ccli: text('ccli'),
  key: text('key'),
  tempo: integer('tempo'),
  lyrics: text('lyrics'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    serviceDate: date('service_date').notNull(),
    status: text('status').notNull().default('draft'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('services_date_idx').on(table.serviceDate)],
);

export const serviceItems = pgTable(
  'service_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    songId: uuid('song_id').references(() => songs.id, { onDelete: 'set null' }),
    title: text('title'),
    order: integer('order').notNull(),
    durationMinutes: integer('duration_minutes'),
  },
  (table) => [index('service_items_service_idx').on(table.serviceId)],
);
