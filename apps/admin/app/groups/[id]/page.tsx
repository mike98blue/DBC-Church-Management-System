import { apiFetch } from '@/lib/api';

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  let group: { id: string; name: string } | null = null;
  let members: { personId: string; role: string }[] = [];
  try {
    const data = await apiFetch<{
      group: { id: string; name: string };
      members: { personId: string; role: string }[];
    }>(`/api/v1/groups/${params.id}`);
    group = data.group;
    members = data.members;
  } catch {}

  return (
    <main>
      <h1>Group — {group?.name ?? params.id}</h1>
      <h2>Members ({members.length})</h2>
      <ul>
        {members.slice(0, 20).map((m) => (
          <li key={m.personId}>
            {m.personId} — {m.role}
          </li>
        ))}
      </ul>
      <p>
        Add via <code>POST /api/v1/groups/:id/members</code> (<code>groups.manage</code>).
      </p>
    </main>
  );
}
