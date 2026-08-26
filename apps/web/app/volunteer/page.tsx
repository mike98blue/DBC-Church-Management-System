import { apiFetch } from '@/lib/api';

export default async function VolunteerCalendarPage() {
  let assignments: { id: string; personId: string; scheduledFor: string; role?: string }[] = [];
  try {
    assignments = await apiFetch<
      { id: string; personId: string; scheduledFor: string; role?: string }[]
    >('/api/v1/scheduling/assignments');
    if (!Array.isArray(assignments)) assignments = [];
  } catch {}

  // Group by date for calendar view
  const byDate = new Map<string, typeof assignments>();
  for (const a of assignments) {
    const key = a.scheduledFor.slice(0, 10);
    const list = byDate.get(key) ?? [];
    list.push(a);
    byDate.set(key, list);
  }

  return (
    <main>
      <h1>Volunteer Calendar</h1>
      <p>
        Availability and assignments. APIs: <code>POST /scheduling/availability</code>,{' '}
        <code>GET /scheduling/availability?personId=</code>,{' '}
        <code>POST /scheduling/assignments</code>.
      </p>
      {byDate.size > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Array.from(byDate.entries())
            .slice(0, 14)
            .map(([date, items]) => (
              <div key={date} style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
                <strong>{date}</strong>
                <ul>
                  {items.map((a) => (
                    <li key={a.id}>
                      {a.personId} — {a.role ?? 'volunteer'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      ) : (
        <p>No assignments or API not running.</p>
      )}
    </main>
  );
}
