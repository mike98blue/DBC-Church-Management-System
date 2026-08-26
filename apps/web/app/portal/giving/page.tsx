import { apiFetch } from '@/lib/api';

export default async function GivingPage() {
  let contributions: { id: string; amountCents: number }[] = [];
  try {
    contributions = await apiFetch<{ id: string; amountCents: number }[]>(
      '/api/v1/giving/contributions',
    );
    if (!Array.isArray(contributions))
      contributions = (contributions as unknown as { data: typeof contributions }).data ?? [];
  } catch {}

  return (
    <main>
      <h1>Giving</h1>
      {contributions.length > 0 ? (
        <p>
          History: {contributions.length} contributions via{' '}
          <code>GET /api/v1/giving/contributions</code>
        </p>
      ) : (
        <p>
          History from <code>GET /api/v1/giving/contributions</code> and statements via{' '}
          <code>GET /api/v1/giving/statements/:donorId?startDate&amp;endDate</code> (CSV,{' '}
          <code>giving.export</code>).
        </p>
      )}
      <p>
        <a href="/portal/giving/manual">Manual entry (G-10)</a> ·{' '}
        <a href="/portal/giving/refund">Refunds (G-13)</a>
      </p>
    </main>
  );
}
