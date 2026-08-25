export default function EventsPage() {
  return (
    <main>
      <h1>Events</h1>
      <p>
        Public events from <code>GET /api/v1/events</code> and <code>?occurrences=true</code> for
        recurring series. Register via <code>POST /api/v1/events/:id/registrations</code>.
      </p>
    </main>
  );
}
