export default function PrayerPage() {
  return (
    <main>
      <h1>Prayer Requests</h1>
      <p>
        Share your prayer request — <code>POST /api/v1/care/prayers</code> (<code>prayer.read</code>
        , visibility: private/pastoral_only).
      </p>
      <form>
        <textarea name="request" placeholder="Your prayer request" />
        <select name="visibility">
          <option value="private">private</option>
          <option value="public">public</option>
          <option value="pastoral_only">pastoral only</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
