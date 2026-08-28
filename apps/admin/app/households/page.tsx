import { apiFetch } from '@/lib/api';

export default async function AdminHouseholdsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q ?? '';
  let households: { id: string; name: string; members?: { personId: string }[] }[] = [];
  try {
    const data = await apiFetch<{ id: string; name: string }[]>('/api/v1/households');
    households = Array.isArray(data) ? data : [];
    // Fetch members for each household (N+1 for MVP, acceptable for small volumes)
    households = await Promise.all(
      households.map(async (h) => {
        try {
          const detail = await apiFetch<{ members: { personId: string }[] }>(
            `/api/v1/households/${h.id}`,
          );
          return { ...h, members: detail.members };
        } catch {
          return h;
        }
      }),
    );
  } catch {}
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
            <li key={h.id}>
              {h.name} — {h.members?.length ?? 0} members
            </li>
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
