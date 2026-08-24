/**
 * Applies pending migrations. Intended for local dev and CI.
 * Production migrations run through the deploy pipeline, never a laptop.
 */
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb } from './client.js';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const db = createDb(databaseUrl);
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied');
  } finally {
    await db.$client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
