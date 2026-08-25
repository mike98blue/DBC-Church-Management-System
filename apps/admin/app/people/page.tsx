import { apiFetch } from '@/lib/api';

export default async function AdminPeoplePage() {
  let count: number | null = null;
  try {
    const data = await apiFetch<{ total: number }>('/api/v1/reports/people/counts');
    // Fallback: try people list if reports not available
    count =
      typeof (data as unknown as { member?: number })?.member === 'number'
        ? (data as unknown as { member: number }).member
        : null;
  } catch {
    try {
      const people = await apiFetch<{ data: unknown[]; total: number }>('/api/v1/people?limit=1');
      count = people.total;
    } catch {
      // API not running in this render
    }
  }

  return (
    <main>
      <h1>People — Staff Admin</h1>
      <p>
        Search, view, and manage people. API:{' '}
        <code>GET /api/v1/people?q=&amp;status=&amp;limit=&amp;offset=</code>
      </p>
      <p>
        Export: <code>GET /api/v1/people/export</code> (<code>people.export</code>, audited)
      </p>
      {count !== null ? (
        <p>
          Live from API: <strong>{count}</strong> people (via <code>/reports/people/counts</code> or{' '}
          <code>/people</code>).
        </p>
      ) : (
        <p>
          <em>
            Run the API (`docker compose up -d && pnpm db:migrate && pnpm --filter @churchos/api
            dev`) to see live counts.
          </em>
        </p>
      )}
    </main>
  );
}
