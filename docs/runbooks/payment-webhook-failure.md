# Payment Webhook Failure Runbook

Stripe is the source of truth for donations (blueprint §12, G-04/G-05).

## Symptoms

- `payment_provider_transactions` missing for a Stripe event id
- Contributions not appearing after a successful Checkout redirect
- Duplicate contributions (idempotency bug)

## Steps

1. **Verify** the Stripe signature was checked — `stripeAdapter.verifyWebhook` must have been called with `Stripe-Signature`.
2. **Check** `payment_provider_transactions` for the event id — if present, the webhook was already processed (idempotent, no double-insert).
3. **Replay** the event from the Stripe Dashboard (or via `stripe events retrieve`) — the handler is idempotent, so replay is safe.
4. **Check** `contributions` and `contribution_allocations` for the related `providerTransactionId`.
5. **Never** mark a donation successful based on the browser redirect alone.
6. **Log** every replay in `audit_events` with `action: giving.webhook_replayed`.
