---
tags: [notes, index]
---

# Docs Notes Index

Working notes that don't belong in ADRs or runbooks. Link freely with `[[...]]`.

## Decision Queue (open leadership decisions — blueprint §46)

1. Product name (working: ChurchOS)
2. Email vendor → [[0009-email-provider]]
3. RPO/RTO sign-off → [[0010-rpo-rto]]
4. Directory privacy — `directory_preferences` now enforces opt-in per field (private by default)
5. Giving page UX (G-02) and remaining donor matching polish (G-08)

## Engineering Scratchpad

- OIDC env vars: `OIDC_JWKS_URI`, `OIDC_ISSUER`, `OIDC_AUDIENCE` — see `.env.example`
- Provider mocks go inert when their env key is set (Stripe, background checks)
- Rate limiting: 120 req/min per IP, `/healthz` exempt — swap store for Redis when multi-instance
- Migrations: `pnpm db:generate` → review SQL → `pnpm db:migrate`; never edit applied files
- Current main: `3347255` → see [[HOME]] for full module map (now 17 API modules, 17 migrations)

## Meeting / Review Logs

- 2026-08-23 — Full audit passed (2 issues found & fixed: prettier drift, drizzle-orm SQL injection GHSA-gpj5-g38j-94v9)
- 2026-08-23 — OIDC guard merged (B-01/B-02); security headers + rate limiting (B-07/B-08)
- 2026-08-23 — Member directory (privacy controls) + G-12 donor statements merged
- 2026-08-23 — Portal spec drafted → [[member-portal]] (next: scaffold `apps/web/app/portal/**`)

## Active Specs

- [[member-portal]] — Member Portal (§5.7) build plan
