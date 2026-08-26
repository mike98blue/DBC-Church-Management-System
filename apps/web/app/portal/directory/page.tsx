import { apiFetch } from '@/lib/api';

export default async function DirectoryPage() {
  let entries: { id: string; firstName: string; lastName: string }[] = [];
  try {
    const data = await apiFetch<
      { id: string; firstName: string; lastName: string }[] | { data: unknown[] }
    >('/api/v1/directory');
    entries = Array.isArray(data)
      ? (data as { id: string; firstName: string; lastName: string }[])
      : [];
  } catch {}

  return (
    <main>
      <h1>Directory</h1>
      {entries.length > 0 ? (
        <ul>
          {entries.slice(0, 20).map((e) => (
            <li key={e.id}>
              {e.firstName} {e.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Opt-in directory. Toggle <code>showInDirectory</code> via{' '}
          <code>PUT /api/v1/directory/preferences/:personId</code> — run the API to see live
          entries.
        </p>
      )}
    </main>
  );
}
