export default function QuickBooksPage() {
  return (
    <main>
      <h1>QuickBooks — Finance Sync</h1>
      <p>
        ChurchOS is the operational source for gifts; QuickBooks is the general ledger (blueprint
        §43). This page shows sync status for{' '}
        <code>POST /api/v1/giving/contributions/:id/sync</code> (stub until{' '}
        <code>QBO_ACCESS_TOKEN</code> is configured).
      </p>
      <ul>
        <li>
          Sync: <code>quickBooksAdapter.syncContribution(id)</code> →{' '}
          <code>{`{synced: false}`}</code> in mock mode
        </li>
        <li>Real: QBO SalesReceipt / Journal Entry via OAuth2 + QBO SDK</li>
      </ul>
    </main>
  );
}
