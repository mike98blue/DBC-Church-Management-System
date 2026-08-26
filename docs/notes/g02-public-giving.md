---
tags: [spec, giving, G-02]
---

# G-02 Public Giving Page

> Dedicated public give page that starts Stripe Checkout, separate from portal. See [[HOME]] module map.

## Route

`apps/web/app/give/page.tsx` — public, no auth. Form posts to `POST /api/v1/giving/checkout` (requires `giving.read` for the session creation; public can still initiate with guest donor).

## Flow

1. Member selects amount + fund (from `GET /giving/funds`)
2. Client POSTs to `/giving/checkout`
3. Redirect to `session.url` (Stripe hosted or mock `https://mock.stripe/checkout/...`)
4. Stripe `checkout.session.completed` webhook → `POST /giving/webhook` (verified, idempotent) creates `contributions` + `contribution_allocations`

Never mark success on redirect alone — webhook is authoritative.

## Links

- ADR 0004 — hosted checkout
- `stripe.adapter.ts` — mock when `STRIPE_SECRET_KEY` absent
