export default function RefundPage() {
  return (
    <main>
      <h1>Refunds / Reversals (G-13)</h1>
      <p>
        Refunds are <strong>separate reversal events</strong>, never silent edits (blueprint §12).
        This POSTs to <code>/api/v1/giving/contributions/:id/refund</code> with{' '}
        <code>giving.manage</code>.
      </p>
      <form>
        <label>
          Contribution ID: <input name="contributionId" placeholder="uuid" />
        </label>
        <br />
        <button type="submit">Refund (creates negative-amount reversal)</button>
      </form>
      <p>
        The original is marked <code>refunded</code>; a new <code>refunded</code> record with
        negative amount is created.
      </p>
    </main>
  );
}
