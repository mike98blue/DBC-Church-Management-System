import { apiFetch } from '@/lib/api';

export default async function RefundPage() {
  let contributions: { id: string; amountCents: number; status: string }[] = [];
  try {
    contributions = await apiFetch<{ id: string; amountCents: number; status: string }[]>(
      '/api/v1/giving/contributions',
    );
    if (!Array.isArray(contributions)) contributions = [];
  } catch {}

  return (
    <main>
      <h1>Refunds / Reversals (G-13)</h1>
      <p>
        Refunds are <strong>separate reversal events</strong>, never silent edits (blueprint §12,{' '}
        <code>giving.manage</code>).
      </p>
      {contributions.length > 0 ? (
        <ul>
          {contributions.slice(0, 10).map((c) => (
            <li key={c.id}>
              {c.id} — ${(c.amountCents / 100).toFixed(2)} ({c.status}){' '}
              <form style={{ display: 'inline' }}>
                <input type="hidden" name="contributionId" value={c.id} />
                <button
                  type="submit"
                  formAction={`/api/v1/giving/contributions/${c.id}/refund`}
                  formMethod="post"
                >
                  Refund
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <form>
          <label>
            Contribution ID:{' '}
            <input name="contributionId" placeholder="uuid" style={{ width: '100%' }} />
          </label>
          <br />
          <button type="submit">Refund (creates negative-amount reversal)</button>
        </form>
      )}
      <p>
        <em>
          Original is marked <code>refunded</code>; a new <code>refunded</code> record with negative
          amount is created.
        </em>
      </p>
    </main>
  );
}
