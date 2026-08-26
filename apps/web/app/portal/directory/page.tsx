import { apiFetch } from '@/lib/api';

export default async function DirectoryPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q?.trim() ?? '';
  let entries: {
    id: string;
    firstName: string;
    lastName: string;
    directory?: { showEmail?: boolean };
  }[] = [];
  try {
    const path = q ? `/api/v1/directory?q=${encodeURIComponent(q)}` : '/api/v1/directory';
    const data = await apiFetch<
      { id: string; firstName: string; lastName: string }[] | { data: unknown[] }
    >(path);
    entries = Array.isArray(data)
      ? (data as { id: string; firstName: string; lastName: string }[])
      : [];
  } catch {}

  return (
    <main>
      <h1>Directory</h1>
      <form>
        <label>
          Search: <input name="q" defaultValue={q} placeholder="name" />
        </label>{' '}
        <button type="submit">Search</button>
      </form>
      <form style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
        <h2>Your visibility</h2>
        <label>
          <input type="checkbox" name="showInDirectory" /> Show me in directory
        </label>
        <br />
        <label>
          <input type="checkbox" name="showEmail" /> Show email
        </label>
        <br />
        <label>
          <input type="checkbox" name="showPhone" /> Show phone
        </label>
        <br />
        <label>
          <input type="checkbox" name="showAddress" /> Show address
        </label>
        <br />
        <button type="submit" formAction="/api/v1/directory/preferences/self">
          Save preferences (PUT /directory/preferences/:personId)
        </button>
      </form>
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
          Opt-in directory — only <code>showInDirectory=true</code> entries appear. Toggle via{' '}
          <code>PUT /api/v1/directory/preferences/:personId</code> (self or{' '}
          <code>directory.manage</code>).
        </p>
      )}
      <p>
        <em>
          Private by default; respects <code>directory_preferences</code> per field.
        </em>
      </p>
    </main>
  );
}
