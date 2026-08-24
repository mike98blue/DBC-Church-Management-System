# ADR 0009: Email Delivery Provider

Status: Proposed
Date: 2026-08-23

## Context

ChurchOS needs transactional and bulk email (H-01…H-07). The provider handles SMTP reputation; ChurchOS owns recipient selection and opt-out.

## Decision

Propose **Postmark** (or Amazon SES) as the default — choice depends on deliverability, nonprofit pricing, and API quality. `MockEmailProvider` is used until a provider is contracted.

## Alternatives considered

- **Postmark**: Excellent deliverability, good API, nonprofit-friendly.
- **Amazon SES**: Low cost, but more ops for reputation/bounces.
- **SendGrid/Mailgun**: Viable, compare pricing.

## Consequences

- Must handle bounce/delivery webhooks and `STOP`/`unsubscribe` correctly (H-06/H-07).
- Opt-out must be respected everywhere.

## Revisit when

Leadership selects the provider (open decision #8).
