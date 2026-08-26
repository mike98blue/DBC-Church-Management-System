import { apiFetch } from '@/lib/api';

export default async function AdminFacilityPage() {
  let reservations: { id: string; title: string; startsAt: string; endsAt: string }[] = [];
  try {
    reservations = await apiFetch<
      { id: string; title: string; startsAt: string; endsAt: string }[]
    >('/api/v1/facilities/reservations');
    if (!Array.isArray(reservations)) reservations = [];
  } catch {}

  return (
    <main>
      <h1>Facility — Reservations Calendar</h1>
      <p>
        Room reservations with overlap detection. API:{' '}
        <code>POST /api/v1/facilities/reservations</code> (<code>facility.manage</code>, 400 if
        overlap).
      </p>
      {reservations.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Title</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Starts</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Ends</th>
            </tr>
          </thead>
          <tbody>
            {reservations.slice(0, 20).map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{new Date(r.startsAt).toLocaleString()}</td>
                <td>{new Date(r.endsAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reservations or API not running.</p>
      )}
    </main>
  );
}
