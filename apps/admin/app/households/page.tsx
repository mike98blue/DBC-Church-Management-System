import { apiFetch } from '@/lib/api';

export default async function AdminHouseholdsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q ?? '';
  let households: { id: string; name: string }[] = [];
  try {
    households = await apiFetch<{ id: string; name: string }[]>('/api/v1/households');
    if (!Array.isArray(households)) households = [];
  } catch {}
  // Simple client-side filter for demo
  if (q) {
    const needle = q.toLowerCase();
    households = households.filter((h) => h.name.toLowerCase().includes(needle));
  }

  return (
    <main>
      <h1>Households — Staff Admin</h1>
      <form>
        <input name="q" defaultValue={q} placeholder="Search households" />
        <button type="submit">Search</button>
      </form>
      {households.length > 0 ? (
        <ul>
          {households.slice(0, 20).map((h) => (
            <li key={h.id}>{h.name}</li>
          ))}
        </ul>
      ) : (
        <p>
          No households or API not running. Manage via <code>POST /api/v1/households</code>.
        </p>
      )}
    </main>
  );
}
