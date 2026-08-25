export default function PortalDashboard() {
  return (
    <main>
      <h1>Member Portal</h1>
      <p>Welcome — this portal consumes the ChurchOS APIs built in the last two weeks.</p>
      <ul>
        <li>Profile: update your contact info</li>
        <li>Household: view your household</li>
        <li>Groups: see your teams</li>
        <li>Events: view public events and register</li>
        <li>Giving: history and statements</li>
        <li>Directory: opt-in privacy controls</li>
      </ul>
      <p>
        In dev, the API is at <code>http://localhost:4000</code> — see{' '}
        <code>docs/notes/member-portal.md</code> for the API table. Auth is via OIDC; in local dev
        use <code>x-mock-permissions</code> headers or the mock login.
      </p>
    </main>
  );
}
