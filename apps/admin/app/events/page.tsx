import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default async function AdminEventsPage() {
  let events: { id: string; title: string; startsAt: string }[] = [];
  try {
    const data = await apiFetch<
      { id: string; title: string; startsAt: string }[] | { data: unknown[] }
    >('/api/v1/events?includePrivate=true');
    events = Array.isArray(data) ? (data as { id: string; title: string; startsAt: string }[]) : [];
  } catch {}

  return (
    <main>
      <h1>Events — Staff Admin</h1>
      <p>
        Create events, manage registrations, record attendance. Public feed at{' '}
        <code>/calendar/events.ics</code>.
      </p>
      <form>
        <input name="title" placeholder="Event title" />
        <input name="startsAt" type="datetime-local" />
        <button type="submit" formAction="/api/v1/events" formMethod="post">
          Create (events.manage)
        </button>
      </form>
      <ul>
        {events.slice(0, 20).map((e) => (
          <li key={e.id}>
            <Link href={`/admin/events/${e.id}`}>{e.title}</Link> —{' '}
            {new Date(e.startsAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  );
}
