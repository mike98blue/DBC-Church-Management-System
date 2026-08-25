import Link from 'next/link';

export default function GivingPage() {
  return (
    <main>
      <h1>Giving</h1>
      <p>
        History from <code>GET /api/v1/giving/contributions</code> and statements via{' '}
        <code>GET /api/v1/giving/statements/:donorId?startDate&amp;endDate</code> (CSV,{' '}
        <code>giving.export</code>).
      </p>
      <nav aria-label="Giving actions">
        <ul>
          <li>
            <Link href="/portal/giving/manual">Manual entry (G-10, cash/check, giving.manage)</Link>
          </li>
          <li>
            <Link href="/portal/giving/refund">Refunds / reversals (G-13, giving.manage)</Link>
          </li>
        </ul>
      </nav>
      <p>
        Manual entry and refunds are <strong>finance-only</strong> and audited. They POST to{' '}
        <code>/api/v1/giving/contributions/manual</code> and <code>/contributions/:id/refund</code>.
      </p>
    </main>
  );
}
