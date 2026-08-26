import { apiFetch } from '@/lib/api';

export default async function QuickBooksPage() {
  let contributions: { id: string; amountCents: number }[] = [];
  try {
    contributions = await apiFetch<{ id: string; amountCents: number }[]>(
      '/api/v1/giving/contributions',
    );
    if (!Array.isArray(contributions)) contributions = [];
  } catch {}

  return (
    <main>
      <h1>QuickBooks — Finance Sync</h1>
      <p>
        ChurchOS is the operational source for gifts; QuickBooks is the general ledger (blueprint
        §43).
      </p>
      <h2>Recent Contributions</h2>
      {contributions.length > 0 ? (
        <ul>
          {contributions.slice(0, 10).map((c) => (
            <li key={c.id}>
              {c.id} — ${(c.amountCents / 100).toFixed(2)}{' '}
              <form style={{ display: 'inline' }}>
                <input type="hidden" name="contributionId" value={c.id} />
                <button
                  type="submit"
                  formAction="/api/v1/giving/contributions/sync"
                  formMethod="post"
                >
                  Sync to QBO (stub)
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p>No contributions or API not running.</p>
      )}
      <p>
        <code>quickBooksAdapter.syncContribution(id)</code> → <code>{`{synced: false}`}</code> in
        mock mode until <code>QBO_ACCESS_TOKEN</code> is set.
      </p>
    </main>
  );
}
