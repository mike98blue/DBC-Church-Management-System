import { apiFetch } from '@/lib/api';

export default async function ManualEntryPage() {
  let funds: { id: string; name: string }[] = [];
  try {
    funds = await apiFetch<{ id: string; name: string }[]>('/api/v1/giving/funds');
    if (!Array.isArray(funds)) funds = [];
  } catch {}

  return (
    <main>
      <h1>Manual Giving Entry (G-10)</h1>
      <p>
        Record offline cash/check gifts — <code>giving.manage</code> (audited, donor auto-created).
      </p>
      <form style={{ display: 'grid', gap: '0.5rem', maxWidth: 400 }}>
        <label>
          Donor person ID:{' '}
          <input name="donorPersonId" placeholder="uuid" required style={{ width: '100%' }} />
        </label>
        <label>
          Fund:{' '}
          <select name="fundId" required style={{ width: '100%' }}>
            <option value="">Select fund</option>
            {funds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount (cents):{' '}
          <input
            name="amountCents"
            type="number"
            min="1"
            placeholder="2500"
            required
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Method:{' '}
          <select name="method" style={{ width: '100%' }}>
            <option value="cash">cash</option>
            <option value="check">check</option>
          </select>
        </label>
        <label>
          Check number: <input name="checkNumber" placeholder="1042" style={{ width: '100%' }} />
        </label>
        <button type="submit" formAction="/api/v1/giving/contributions/manual" formMethod="post">
          Record
        </button>
      </form>
      <p>
        <em>
          On success, appears in <code>GET /giving/contributions</code> and statements.
        </em>
      </p>
    </main>
  );
}
