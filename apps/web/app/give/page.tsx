import { apiFetch } from '@/lib/api';

export default async function GivePage() {
  let funds: { id: string; name: string }[] = [];
  try {
    funds = await apiFetch<{ id: string; name: string }[]>('/api/v1/giving/funds');
    if (!Array.isArray(funds)) funds = [];
  } catch {}

  return (
    <main>
      <h1>Give</h1>
      <p>
        Support the ministry — select an amount and fund. You&apos;ll be redirected to Stripe
        Checkout (hosted, no card data touches ChurchOS).
      </p>
      {funds.length > 0 ? (
        <form action="/api/giving/checkout" method="post">
          <label>
            Fund:{' '}
            <select name="fundId">
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>{' '}
          <label>
            Amount (USD): <input name="amount" type="number" min="1" step="1" defaultValue="25" />
          </label>{' '}
          <button type="submit">Continue to Checkout</button>
        </form>
      ) : (
        <p>
          Funds are managed at <code>POST /api/v1/giving/funds</code> (<code>giving.manage</code>).
          Run the API and seed (<code>pnpm db:seed</code> creates the General fund) to see live
          options.
        </p>
      )}
      <p>
        <em>
          Never enter card data here — the Checkout Session is created server-side and you pay on
          Stripe&apos;s hosted page. The webhook is the source of truth.
        </em>
      </p>
    </main>
  );
}
