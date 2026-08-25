export default function AdminPeoplePage() {
  return (
    <main>
      <h1>People — Staff Admin</h1>
      <p>
        Search, view, and manage people. API:{' '}
        <code>GET /api/v1/people?q=&status=&limit=&offset=</code>
      </p>
      <p>
        Export: <code>GET /api/v1/people/export</code> (<code>people.export</code>, audited)
      </p>
    </main>
  );
}
