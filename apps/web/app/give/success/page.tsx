export default function GiveSuccessPage() {
  return (
    <main>
      <h1>Thank you for your gift!</h1>
      <p>
        Your contribution is being processed. You&apos;ll receive a receipt once the payment is
        confirmed.
      </p>
      <p>
        <em>
          The webhook is the source of truth — don&apos;t rely on this redirect alone. Check your
          giving history in the portal.
        </em>
      </p>
    </main>
  );
}
