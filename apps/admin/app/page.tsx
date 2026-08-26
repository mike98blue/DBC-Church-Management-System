import { apiFetch } from '@/lib/api';

export default async function AdminDashboard() {
  let summary: { totalPeople: number; upcomingEvents: number; totalGivingCents: number } | null =
    null;
  try {
    summary = await apiFetch<{
      totalPeople: number;
      upcomingEvents: number;
      totalGivingCents: number;
    }>('/api/v1/dashboard/summary');
  } catch {}

  return (
    <main>
      <h1>Staff Admin</h1>
      {summary ? (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ border: '1px solid #ddd', padding: '1rem', flex: 1 }}>
            <strong>{summary.totalPeople}</strong>
            <div>People</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '1rem', flex: 1 }}>
            <strong>{summary.upcomingEvents}</strong>
            <div>Upcoming Events</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '1rem', flex: 1 }}>
            <strong>${(summary.totalGivingCents / 100).toFixed(2)}</strong>
            <div>Total Giving</div>
          </div>
        </div>
      ) : (
        <p>
          <em>
            Run the API to see live metrics from <code>GET /api/v1/dashboard/summary</code>{' '}
            (people.read).
          </em>
        </p>
      )}
      <ul>
        <li>People: search, export, tags, custom fields</li>
        <li>Households & Groups: rosters</li>
        <li>Events: recurrence, calendar feed, registrations</li>
        <li>Giving: funds, manual/refunds, statements, QuickBooks sync</li>
        <li>Directory: opt-in privacy controls</li>
      </ul>
    </main>
  );
}
