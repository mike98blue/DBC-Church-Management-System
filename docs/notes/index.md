---
tags: [notes, index]
---

# Docs Notes Index

Working notes that don't belong in ADRs or runbooks. Link freely with `[[...]]`.

## Decision Queue (open leadership decisions — blueprint §46)

1. Product name (working: ChurchOS)
2. Email vendor → [[0009-email-provider]]
3. RPO/RTO sign-off → [[0010-rpo-rto]]
4. Giving page UX (G-02) → [[g02-public-giving]] (in progress)
5. Event admin UX (E-08) → [[e08-event-admin]] (next)

## Engineering Scratchpad

- OIDC env vars: `OIDC_JWKS_URI`, `OIDC_ISSUER`, `OIDC_AUDIENCE` — see `.env.example`
- Provider mocks go inert when their env key is set (Stripe, background checks)
- Rate limiting: 120 req/min per IP, `/healthz` exempt — swap store for Redis when multi-instance
- Migrations: `pnpm db:generate` → review SQL → `pnpm db:migrate`; never edit applied files
- Current main: `930494b` → see [[HOME]] for full module map (22 → 23 modules, 17 migrations)

## Meeting / Review Logs

- 2026-08-23 — Full audit passed (2 issues found & fixed: prettier drift, drizzle-orm SQL injection GHSA-gpj5-g38j-94v9)
- 2026-08-23 — OIDC guard merged (B-01/B-02); security headers + rate limiting (B-07/B-08)
- 2026-08-23 — Member directory + G-12 statements merged; portal spec drafted → [[member-portal]]
- 2026-08-23 — Next: Payload CMS install → [[payload-install]], G-08 polish, H-04 templates
- 2026-08-23 — A: Admin Groups live search + Public /give amount buttons (no new decisions)

## Active Specs

- [[member-portal]] — Member Portal (§5.7) build plan
- [[payload-install]] — Payload CMS live install (D-01)
- [[g08-donor-matching]] — Donor matching polish
- [[h04-email-templates]] — Email templates
