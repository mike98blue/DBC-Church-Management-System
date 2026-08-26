import { apiFetch } from '@/lib/api';

export default async function EventsPage() {
  let events: { id: string; title: string; startsAt: string }[] = [];
  try {
    const data = await apiFetch<
      | { id: string; title: string; startsAt: string }[]
      | { data: { id: string; title: string; startsAt: string }[] }
    >('/api/v1/events');
    events = Array.isArray(data)
      ? (data as { id: string; title: string; startsAt: string }[])
      : ((data as never as { data: unknown[] }).data as never);
  } catch {}
  // Try occurrences expansion
  let occurrences: { eventId: string; title: string; startsAt: string }[] = [];
  try {
    occurrences = await apiFetch<{ eventId: string; title: string; startsAt: string }[]>(
      '/api/v1/events?occurrences=true',
    );
    if (!Array.isArray(occurrences)) occurrences = [];
  } catch {}

  return (
    <main>
      <h1>Events</h1>
      {events.length > 0 || occurrences.length > 0 ? (
        <ul>
          {(occurrences.length > 0 ? occurrences : events).slice(0, 10).map((e) => {
            const key =
              (e as { id?: string; eventId?: string }).id ?? (e as { eventId: string }).eventId;
            return (
              <li key={key}>
                {(e as { title: string }).title} — {(e as { startsAt: string }).startsAt}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>
          Public events from <code>GET /api/v1/events</code> and <code>?occurrences=true</code> for
          recurring series. Register via <code>POST /api/v1/events/:id/registrations</code>.
        </p>
      )}
    </main>
  );
}
