import { apiFetch } from '@/lib/api';

export default async function HouseholdPage() {
  let household: {
    id: string;
    name: string;
    members?: { personId: string; role: string }[];
  } | null = null;
  try {
    const list = await apiFetch<{ id: string; name: string }[]>('/api/v1/households');
    const first = Array.isArray(list) ? ((list[0] as { id: string; name: string }) ?? null) : null;
    if (first) {
      try {
        const detail = await apiFetch<{
          household: { id: string; name: string };
          members: { personId: string; role: string }[];
        }>(`/api/v1/households/${first.id}`);
        household = { ...detail.household, members: detail.members };
      } catch {
        household = first as { id: string; name: string };
      }
    }
  } catch {}

  return (
    <main>
      <h1>Household</h1>
      {household ? (
        <>
          <p>
            Household from API: <code>{household.name}</code> ({household.id})
          </p>
          {household.members && household.members.length > 0 && (
            <ul>
              {household.members.map((m) => (
                <li key={m.personId}>
                  {m.personId} — {m.role}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>
          View your household. Data from <code>GET /api/v1/households/:id</code> — run the API to
          see live data.
        </p>
      )}
    </main>
  );
}
