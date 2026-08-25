export default function AdminGivingPage() {
  return (
    <main>
      <h1>Giving — Finance Admin</h1>
      <ul>
        <li>
          Funds: <code>POST /api/v1/giving/funds</code>
        </li>
        <li>
          Checkout: <code>POST /giving/checkout</code> (hosted, no card data)
        </li>
        <li>
          Manual: <code>POST /giving/contributions/manual</code> (cash/check, audited)
        </li>
        <li>
          Refunds: <code>POST /giving/contributions/:id/refund</code> (reversal event)
        </li>
        <li>
          Exports: <code>GET /giving/export</code> and <code>GET /giving/statements/:donorId</code>{' '}
          (both audited)
        </li>
        <li>
          Webhook: <code>POST /giving/webhook</code> (verified, idempotent)
        </li>
      </ul>
      <p>
        All finance exports are audited in <code>audit_events</code>.
      </p>
    </main>
  );
}
