import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}) {
  const q = searchParams?.q ?? '';
  const page = Number(searchParams?.page ?? '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  let people: {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    tags?: string[];
  }[] = [];
  let total = 0;
  try {
    const data = await apiFetch<{
      data: { id: string; firstName: string; lastName: string; status: string }[];
      total: number;
    }>(`/api/v1/people?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`);
    people = await Promise.all(
      data.data.map(async (p) => {
        try {
          const tags = await apiFetch<string[]>(`/api/v1/tags/person/${p.id}`);
          return { ...p, tags: Array.isArray(tags) ? tags : [] };
        } catch {
          return { ...p, tags: [] };
        }
      }),
    );
    total = data.total;
  } catch {}

  return (
    <main>
      <h1>People — Staff Admin</h1>
      <form>
        <input name="q" defaultValue={q} placeholder="Search name" />
        <button type="submit">Search</button>
        <Link href="/admin/people/export" style={{ marginLeft: '1rem' }}>
          Export CSV (people.export)
        </Link>
      </form>
      <p>
        {total} total &middot; Page {page} &middot; <code>GET /api/v1/people</code> +{' '}
        <code>/tags/person/:id</code> + <code>/custom-fields/values?personId=</code>
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id}>
              <td>
                {p.firstName} {p.lastName}
              </td>
              <td>{p.status}</td>
              <td>{p.tags?.join(', ') ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {people.length === 0 && <p>No people or API not running.</p>}
    </main>
  );
}
