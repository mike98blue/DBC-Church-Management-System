export default function AdminDashboard() {
  return (
    <main>
      <h1>Staff Admin</h1>
      <p>Staff and volunteer admin UI — consumes the ChurchOS APIs with RBAC.</p>
      <ul>
        <li>
          People: <code>GET /api/v1/people</code> (<code>people.read</code>), search, export
        </li>
        <li>Households: management and relationships</li>
        <li>Groups: ministry teams and rosters</li>
        <li>Events: create, registration admin, attendance</li>
        <li>
          Giving: funds, contributions, manual entry, refunds, statements, exports (all audited)
        </li>
      </ul>
      <p>
        All data access is server-side authorized. See <code>AGENTS.md</code> and{' '}
        <code>SECURITY.md</code>.
      </p>
    </main>
  );
}
