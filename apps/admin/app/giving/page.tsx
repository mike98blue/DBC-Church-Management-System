import { apiFetch } from '@/lib/api';

export default async function AdminGivingPage() {
  let funds: { id: string; name: string }[] = [];
  let contributions: { id: string; amountCents: number; status: string }[] = [];
  try {
    funds = await apiFetch<{ id: string; name: string }[]>('/api/v1/giving/funds');
    if (!Array.isArray(funds)) funds = [];
  } catch {}
  try {
    contributions = await apiFetch<{ id: string; amountCents: number; status: string }[]>(
      '/api/v1/giving/contributions',
    );
    if (!Array.isArray(contributions)) contributions = [];
  } catch {}

  return (
    <main>
      <h1>Giving — Finance Admin</h1>
      <h2>Funds</h2>
      {funds.length > 0 ? (
        <ul>
          {funds.map((f) => (
            <li key={f.id}>
              {f.name} — <code>{f.id}</code>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No funds or API not running. Create via <code>POST /api/v1/giving/funds</code> (
          <code>giving.manage</code>).
        </p>
      )}
      <h2>Recent Contributions</h2>
      {contributions.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {contributions.slice(0, 10).map((c) => (
              <tr key={c.id}>
                <td>${(c.amountCents / 100).toFixed(2)}</td>
                <td>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No contributions yet.</p>
      )}
      <h2>Manual Entry (G-10)</h2>
      <form style={{ display: 'grid', gap: '0.5rem', maxWidth: 400 }}>
        <input name="donorPersonId" placeholder="Donor person ID (uuid)" required />
        <input name="fundId" placeholder="Fund ID" required />
        <input name="amountCents" type="number" placeholder="Amount cents" required />
        <select name="method">
          <option value="cash">cash</option>
          <option value="check">check</option>
        </select>
        <input name="checkNumber" placeholder="Check # (if check)" />
        <button type="submit" formAction="/api/v1/giving/contributions/manual" formMethod="post">
          Record (giving.manage, audited)
        </button>
      </form>
      <h2>Statements & Exports (G-12/G-11)</h2>
      <p>
        <code>GET /giving/export</code> and{' '}
        <code>GET /giving/statements/:donorId?startDate=&amp;endDate=</code> (both audited,{' '}
        <code>giving.export</code>).
      </p>
    </main>
  );
}
