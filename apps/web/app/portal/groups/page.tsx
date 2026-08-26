import { apiFetch } from '@/lib/api';

export default async function GroupsPage() {
  let groups: { id: string; name: string }[] = [];
  try {
    const data = await apiFetch<
      { data: { id: string; name: string }[] } | { id: string; name: string }[]
    >('/api/v1/groups');
    groups = Array.isArray(data)
      ? (data as { id: string; name: string }[])
      : ((data as { data: { id: string; name: string }[] }).data ?? []);
  } catch {}

  return (
    <main>
      <h1>Groups</h1>
      {groups.length > 0 ? (
        <ul>
          {groups.slice(0, 10).map((g) => (
            <li key={g.id}>{g.name}</li>
          ))}
        </ul>
      ) : (
        <p>
          Your ministry teams. Data from <code>GET /api/v1/groups</code> — run the API to see live
          data.
        </p>
      )}
    </main>
  );
}
