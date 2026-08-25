export default function GivingPage() {
  return (
    <main>
      <h1>Giving</h1>
      <p>
        History from <code>GET /api/v1/giving/contributions</code> and statements via{' '}
        <code>GET /api/v1/giving/statements/:donorId?startDate&endDate</code> (CSV,{' '}
        <code>giving.export</code>).
      </p>
    </main>
  );
}
