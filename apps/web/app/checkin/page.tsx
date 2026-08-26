export default function CheckinKioskPage() {
  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Check-in Kiosk</h1>
      <p>
        Secure pickup with room capacity. APIs: <code>POST /api/v1/checkin/check-in</code> and{' '}
        <code>POST /checkin/:id/check-out</code> (<code>checkin.operate</code>).
      </p>
      <form style={{ maxWidth: 400, margin: '0 auto' }}>
        <input
          name="childPersonId"
          placeholder="Child person ID (uuid)"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input name="eventId" placeholder="Event ID" style={{ width: '100%', marginBottom: 8 }} />
        <input
          name="roomId"
          placeholder="Room ID (optional)"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 12, fontSize: 18 }}>
          Check In (generates pickup code)
        </button>
      </form>
      <p>
        <em>
          Pickup code is 6-digit crypto-random, checked on checkout. Room capacity enforced
          server-side.
        </em>
      </p>
      <p>
        <a href="/api/v1/checkin/roster?eventId=">
          Emergency roster (GET /checkin/roster, checkin.operate)
        </a>
      </p>
    </main>
  );
}
