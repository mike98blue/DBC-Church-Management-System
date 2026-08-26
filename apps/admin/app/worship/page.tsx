import { apiFetch } from '@/lib/api';

export default async function AdminWorshipPage() {
  let services: { id: string; title: string; serviceDate: string }[] = [];
  try {
    // Worship services are at GET /api/v1/worship/services/:id, list via GET /worship/services
    services = await apiFetch<{ id: string; title: string; serviceDate: string }[]>(
      '/api/v1/worship/services',
    );
    if (!Array.isArray(services)) services = [];
  } catch {
    try {
      const data = await apiFetch<{ id: string; title: string }[]>('/api/v1/worship/services');
      services = Array.isArray(data)
        ? (data as { id: string; title: string; serviceDate: string }[])
        : [];
    } catch {}
  }

  return (
    <main>
      <h1>Worship — Services & Teams</h1>
      <p>
        Services with ordered items (songs, readings, etc.). APIs:{' '}
        <code>POST /worship/services</code>, <code>POST /worship/services/:id/items</code> (
        <code>worship.manage</code>), <code>GET /worship/services/:id</code> (
        <code>worship.read</code>).
      </p>
      <form>
        <input name="title" placeholder="Service title (e.g. Sunday AM)" />
        <input name="serviceDate" type="date" />
        <button type="submit">Create service (worship.manage)</button>
      </form>
      {services.length > 0 ? (
        <ul>
          {services.slice(0, 20).map((s) => (
            <li key={s.id}>
              {s.title} — {s.serviceDate}
            </li>
          ))}
        </ul>
      ) : (
        <p>No services or API not running.</p>
      )}
    </main>
  );
}
