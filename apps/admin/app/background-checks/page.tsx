import { apiFetch } from '@/lib/api';

export default async function AdminBackgroundChecksPage() {
  let checks: { id: string; personId: string; status: string }[] = [];
  try {
    checks = await apiFetch<{ id: string; personId: string; status: string }[]>(
      '/api/v1/background-checks',
    );
    if (!Array.isArray(checks)) checks = [];
  } catch {}

  return (
    <main>
      <h1>Background Checks — Admin</h1>
      <p>
        Adapter stub — <code>POST /api/v1/background-checks</code> (
        <code>backgroundcheck.manage</code>) with <code>personId</code>. Mock when{' '}
        <code>BACKGROUNDCHECK_API_KEY</code> absent.
      </p>
      {checks.length > 0 ? (
        <ul>
          {checks.slice(0, 20).map((c) => (
            <li key={c.id}>
              {c.personId} — {c.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No checks or API not running.</p>
      )}
    </main>
  );
}
