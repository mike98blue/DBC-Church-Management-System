import { apiFetch } from '@/lib/api';

export default async function HouseholdPage() {
  let household: { id: string; name: string } | null = null;
  try {
    const data = await apiFetch<{ household: { id: string; name: string }; members: unknown[] }>(
      '/api/v1/households?limit=1',
    );
    // Fallback: try reports or first household
    void data;
  } catch {}
  // Try direct fetch for demo
  try {
    const list = await apiFetch<{ id: string; name: string }[]>('/api/v1/households');
    household = Array.isArray(list) ? ((list[0] as { id: string; name: string }) ?? null) : null;
  } catch {}

  return (
    <main>
      <h1>Household</h1>
      {household ? (
        <p>
          Household from API: <code>{household.name}</code> ({household.id})
        </p>
      ) : (
        <p>
          View your household. Data from <code>GET /api/v1/households/:id</code> — run the API to
          see live data.
        </p>
      )}
    </main>
  );
}
