import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default async function AdminGroupsPage() {
  let groups: { id: string; name: string; type: string }[] = [];
  try {
    groups = await apiFetch<{ id: string; name: string; type: string }[]>('/api/v1/groups');
    if (!Array.isArray(groups)) groups = [];
  } catch {}

  return (
    <main>
      <h1>Groups — Staff Admin</h1>
      <p>Ministry teams and rosters. Click a group to manage its roster.</p>
      {groups.length > 0 ? (
        <ul>
          {groups.map((g) => (
            <li key={g.id}>
              <Link href={`/admin/groups/${g.id}`}>{g.name}</Link> — {g.type}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No groups or API not running. Create via <code>POST /api/v1/groups</code> (
          <code>groups.manage</code>).
        </p>
      )}
    </main>
  );
}
