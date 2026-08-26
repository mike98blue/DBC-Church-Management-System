export default function SmsAdminPage() {
  return (
    <main>
      <h1>SMS — Admin</h1>
      <p>
        Phase 2 mock — <code>POST /api/v1/sms/send</code> (<code>communications.send</code>) with
        opt-out respected. Configure <code>SMS_API_KEY</code> + <code>SMS_FROM_NUMBER</code> for
        live Twilio.
      </p>
      <form>
        <input
          name="to"
          placeholder="To (phone or personId uuid)"
          style={{ width: '100%', marginBottom: 8 }}
        />
        <textarea name="body" placeholder="Message body" style={{ width: '100%', height: 80 }} />
        <button type="submit" formAction="/api/v1/sms/send" formMethod="post">
          Send (mock)
        </button>
      </form>
    </main>
  );
}
