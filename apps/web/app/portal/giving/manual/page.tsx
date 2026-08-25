export default function ManualEntryPage() {
  return (
    <main>
      <h1>Manual Giving Entry (G-10)</h1>
      <p>
        Record offline cash/check gifts. This POSTs to{' '}
        <code>/api/v1/giving/contributions/manual</code> with <code>giving.manage</code> (audited).
      </p>
      <form>
        <label>
          Donor person ID: <input name="donorPersonId" placeholder="uuid" />
        </label>
        <br />
        <label>
          Fund ID: <input name="fundId" placeholder="uuid" />
        </label>
        <br />
        <label>
          Amount (cents): <input name="amountCents" type="number" />
        </label>
        <br />
        <label>
          Method:{' '}
          <select name="method">
            <option value="cash">cash</option>
            <option value="check">check</option>
          </select>
        </label>
        <br />
        <label>
          Check number: <input name="checkNumber" />
        </label>
        <br />
        <button type="submit">Record</button>
      </form>
      <p>
        On success, the contribution appears in <code>GET /giving/contributions</code> and in donor
        statements.
      </p>
    </main>
  );
}
