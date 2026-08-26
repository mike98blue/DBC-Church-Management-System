import { apiFetch } from '@/lib/api';

export default async function EventAdminPage({ params }: { params: { id: string } }) {
  let event: { id: string; title: string } | null = null;
  let registrations: { id: string; status: string }[] = [];
  let attendance: { id: string; personId: string }[] = [];

  try {
    event = await apiFetch<{ id: string; title: string }>(`/api/v1/events/${params.id}`);
  } catch {}
  try {
    const regs = await apiFetch<{ id: string; status: string }[] | { data: unknown[] }>(
      `/api/v1/events/${params.id}/registrations`,
    );
    registrations = Array.isArray(regs) ? (regs as { id: string; status: string }[]) : [];
  } catch {}
  try {
    const att = await apiFetch<{ id: string; personId: string }[] | { data: unknown[] }>(
      `/api/v1/events/${params.id}/attendance`,
    );
    attendance = Array.isArray(att) ? (att as { id: string; personId: string }[]) : [];
  } catch {}

  return (
    <main>
      <h1>Event — {event?.title ?? params.id}</h1>
      <p>
        Admin view: <code>GET /events/:id/registrations</code> (<code>events.manage</code>) and{' '}
        <code>GET /events/:id/attendance</code> (<code>attendance.record</code>).
      </p>
      <h2>Registrations ({registrations.length})</h2>
      {registrations.length > 0 ? (
        <ul>
          {registrations.slice(0, 20).map((r) => (
            <li key={r.id}>
              {r.id} — {r.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No registrations or API not running.</p>
      )}
      <h2>Attendance ({attendance.length})</h2>
      {attendance.length > 0 ? (
        <ul>
          {attendance.slice(0, 20).map((a) => (
            <li key={a.id}>{a.personId}</li>
          ))}
        </ul>
      ) : (
        <p>No attendance yet.</p>
      )}
    </main>
  );
}
