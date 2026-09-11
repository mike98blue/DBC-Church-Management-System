import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index.js';

export function createDb(databaseUrl: string) {
  const needsSsl =
    databaseUrl.includes('sslmode=') || databaseUrl.includes('render.com') || databaseUrl.includes('onrender.com');
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
  return drizzle(pool, { schema });
}

export type Database = ReturnType<typeof createDb>;

export { schema };
