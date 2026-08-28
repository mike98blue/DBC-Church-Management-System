export default function ContactPage() {
  return (
    <main>
      <h1>Contact</h1>
      <p>
        Get in touch — this form POSTs to <code>/api/v1/forms/:id/submissions</code> (contact form).
      </p>
      <form>
        <input name="name" placeholder="Name" />
        <input name="email" type="email" placeholder="Email" />
        <textarea name="message" placeholder="Message" />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
