/**
 * Seeds synthetic data only. NEVER load real congregant PII into any
 * environment (blueprint Section 26).
 */
import { createDb } from './client.js';
import { households, householdMembers, people } from './schema/index.js';

const SYNTHETIC_PEOPLE = [
  { firstName: 'Alex', lastName: 'Example', status: 'staff' as const },
  { firstName: 'Jordan', lastName: 'Example', status: 'member' as const },
  { firstName: 'Taylor', lastName: 'Example', status: 'member' as const },
  { firstName: 'Morgan', lastName: 'Example', status: 'guest' as const },
] as const;

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const db = createDb(databaseUrl);
  try {
    const inserted = await db
      .insert(people)
      .values([...SYNTHETIC_PEOPLE])
      .returning();
    console.log(`Inserted ${inserted.length} synthetic people`);

    const [alex, jordan, taylor, morgan] = inserted;
    if (!alex || !jordan || !taylor || !morgan) {
      throw new Error('Unexpected seed state: missing inserted people');
    }

    const [household] = await db
      .insert(households)
      .values({ name: 'Example Household' })
      .returning();
    if (!household) {
      throw new Error('Unexpected seed state: household not inserted');
    }

    await db.insert(householdMembers).values([
      { householdId: household.id, personId: jordan.id, role: 'head' },
      { householdId: household.id, personId: taylor.id, role: 'spouse' },
      { householdId: household.id, personId: morgan.id, role: 'child' },
      { householdId: household.id, personId: alex.id, role: 'other' },
    ]);
    console.log('Seeded synthetic household with 4 members');
  } finally {
    await db.$client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
