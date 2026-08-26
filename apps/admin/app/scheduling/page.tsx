import { apiFetch } from '@/lib/api';

export default async function AdminSchedulingPage() {
  let assignments: { id: string; personId: string; scheduledFor: string }[] = [];
  try {
    assignments = await apiFetch<{ id: string; personId: string; scheduledFor: string }[]>(
      '/api/v1/scheduling/assignments',
    );
    if (!Array.isArray(assignments)) assignments = [];
  } catch {}

  return (
    <main>
      <h1>Scheduling — Volunteer Assignments</h1>
      <p>
        Manage availability and assignments. APIs: <code>POST /scheduling/availability</code>,{' '}
        <code>GET /scheduling/availability?personId=</code>,{' '}
        <code>POST /scheduling/assignments</code>.
      </p>
      {assignments.length > 0 ? (
        <ul>
          {assignments.slice(0, 20).map((a) => (
            <li key={a.id}>
              {a.personId} — {a.scheduledFor}
            </li>
          ))}
        </ul>
      ) : (
        <p>No assignments or API not running.</p>
      )}
    </main>
  );
}
