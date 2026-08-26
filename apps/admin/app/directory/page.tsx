import { apiFetch } from '@/lib/api';

export default async function AdminDirectoryPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q ?? '';
  let entries: { id: string; firstName: string; lastName: string }[] = [];
  try {
    const path = q ? `/api/v1/directory?q=${encodeURIComponent(q)}` : '/api/v1/directory';
    entries = await apiFetch<{ id: string; firstName: string; lastName: string }[]>(path);
    if (!Array.isArray(entries)) entries = [];
  } catch {}

  return (
    <main>
      <h1>Directory — Admin</h1>
      <form>
        <input name="q" defaultValue={q} placeholder="Search directory" />
        <button type="submit">Search</button>
      </form>
      <p>
        Opt-in directory — <code>GET /api/v1/directory</code> (<code>directory.read</code>). Only{' '}
        <code>showInDirectory=true</code> entries appear.
      </p>
      {entries.length > 0 ? (
        <ul>
          {entries.slice(0, 20).map((e) => (
            <li key={e.id}>
              {e.firstName} {e.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p>No directory entries or API not running.</p>
      )}
    </main>
  );
}
