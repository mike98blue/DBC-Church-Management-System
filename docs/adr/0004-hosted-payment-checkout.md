# ADR 0004: Hosted Payment Checkout (Stripe)

Status: Proposed
Date: 2026-08-23

## Context

ChurchOS must accept online gifts without becoming a card-data processor.
PCI scope should be minimized and sensitive payment data must never flow
through application servers or logs.

## Decision

Use a hosted payment flow (Stripe Checkout as the default candidate) for all
online gifts.

Flow:

1. Member selects amount and fund in ChurchOS.
2. ChurchOS creates a checkout session with the payment provider.
3. Donor enters payment data on the provider-hosted page.
4. Provider processes the payment.
5. Provider sends a signed webhook to ChurchOS.
6. ChurchOS verifies the signature and processes it idempotently.
7. ChurchOS stores only non-sensitive transaction metadata.

The signed webhook — never the browser redirect — is the authoritative
completion event.

## Alternatives considered

- **Self-hosted card fields (PSP API)**: Higher PCI burden (SAQ D), more risk.
- **Provider SDK embedded components**: Middle ground; revisit if donor UX demands it.
- **Other processors (Pushpay, Tithe.ly giving)**: Tightly coupled to their platforms.

## Consequences

- ✅ Minimal PCI scope (SAQ A)
- ✅ No raw card data in ChurchOS
- ⚠️ Provider dependency for the donation UX
- ⚠️ Webhook infrastructure required (verification, idempotency, retries)

## Security/privacy impact

High. Never log card data. Restrict finance permissions. Audit finance exports.

## Revisit when

Church leadership selects the final payment provider, or donor UX requires
embedded components.
