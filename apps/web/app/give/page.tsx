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
        <form
          action={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1/giving/checkout`}
          method="post"
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'end', flexWrap: 'wrap' }}
        >
          <label>
            Fund:{' '}
            <select name="fundId">
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Amount:{' '}
            <select name="amount" defaultValue="25">
              <option value="25">$25</option>
              <option value="50">$50</option>
              <option value="100">$100</option>
              <option value="250">$250</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <input
            name="amountCustom"
            type="number"
            min="1"
            step="1"
            placeholder="Custom USD"
            style={{ width: 120 }}
          />
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
      <p>
        <a href="/give/success">Success</a> · <a href="/give/cancel">Cancel</a> (redirect targets)
      </p>
    </main>
  );
}
