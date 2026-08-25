export default function AdminEventsPage() {
  return (
    <main>
      <h1>Events — Staff Admin</h1>
      <p>
        Create events with recurrence, manage registrations, record attendance. APIs:{' '}
        <code>/api/v1/events</code>, <code>/events/:id/registrations</code>,{' '}
        <code>/events/:id/attendance</code>, <code>/calendar/events.ics</code> (public)
      </p>
    </main>
  );
}
