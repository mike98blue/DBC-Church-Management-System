import { apiFetch } from '@/lib/api';

export default async function GivingPage() {
  let contributions: { id: string; amountCents: number; status: string; createdAt: string }[] = [];
  try {
    contributions = await apiFetch<
      { id: string; amountCents: number; status: string; createdAt: string }[]
    >('/api/v1/giving/contributions');
    if (!Array.isArray(contributions))
      contributions = (contributions as unknown as { data: typeof contributions }).data ?? [];
  } catch {}

  return (
    <main>
      <h1>Giving</h1>
      {contributions.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {contributions.slice(0, 10).map((c) => (
              <tr key={c.id}>
                <td>${(c.amountCents / 100).toFixed(2)}</td>
                <td>{c.status}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          History from <code>GET /api/v1/giving/contributions</code> — run the API to see live data.
        </p>
      )}
      <p>
        Statements: <code>GET /api/v1/giving/statements/:donorId?startDate&amp;endDate</code> (CSV,{' '}
        <code>giving.export</code>).
      </p>
      <p>
        <a href="/portal/giving/manual">Manual entry (G-10)</a> ·{' '}
        <a href="/portal/giving/refund">Refunds (G-13)</a>
      </p>
    </main>
  );
}
