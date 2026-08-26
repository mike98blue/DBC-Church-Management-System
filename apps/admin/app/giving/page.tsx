import { apiFetch } from '@/lib/api';

export default async function AdminGivingPage() {
  let funds: { id: string; name: string }[] = [];
  try {
    funds = await apiFetch<{ id: string; name: string }[]>('/api/v1/giving/funds');
    if (!Array.isArray(funds)) funds = [];
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
      <h2>Manual Entry (G-10)</h2>
      <form>
        <input name="donorPersonId" placeholder="Donor person ID (uuid)" />
        <input name="fundId" placeholder="Fund ID" />
        <input name="amountCents" type="number" placeholder="Amount cents" />
        <select name="method">
          <option value="cash">cash</option>
          <option value="check">check</option>
        </select>
        <input name="checkNumber" placeholder="Check #" />
        <button type="submit" formAction="/api/v1/giving/contributions/manual" formMethod="post">
          Record (giving.manage)
        </button>
      </form>
      <h2>Statements (G-12)</h2>
      <p>
        <code>GET /api/v1/giving/statements/:donorId?startDate=&amp;endDate=</code> (CSV,{' '}
        <code>giving.export</code>).
      </p>
      <p>
        <code>GET /giving/export</code> and <code>GET /giving/statements/:donorId</code> (both
        audited in <code>audit_events</code>).
      </p>
    </main>
  );
}
