import { cmsFetch } from '@/lib/cms';

export const revalidate = 60;

export default async function MinistriesPage() {
  let ministries: { id: string; name: string; description?: string }[] = [];
  try {
    const data = await cmsFetch<{ docs: { id: string; name: string; description?: string }[] }>(
      '/api/ministries?limit=20',
    );
    ministries = data.docs;
  } catch {
    // CMS not running — show placeholder
  }

  return (
    <main>
      <h1>Ministries</h1>
      {ministries.length > 0 ? (
        <ul>
          {ministries.map((m) => (
            <li key={m.id}>
              <strong>{m.name}</strong> — {m.description ?? 'No description'}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Ministry content from Payload CMS (<code>ministries</code> collection, ADR 0005). Run the
          CMS (<code>pnpm --filter @churchos/cms dev</code> → <code>http://localhost:3002</code>) to
          see live entries.
        </p>
      )}
    </main>
  );
}
