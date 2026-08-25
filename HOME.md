---
tags: [moc, dashboard]
---

# 🏠 ChurchOS Home

> Map of Content for the ChurchOS vault. Open this note on vault launch.

## 📌 Quick Links

- [[BLUEPRINT]] — full product & engineering blueprint (research + plan)
- [[README]] — repo overview & quick start
- [[AGENTS]] — AI operating rules (applies to humans too)
- [[CONTRIBUTING]] — workflow, quality gates, branch model
- [[SECURITY]] — security policy & sensitive domains

## 🏛️ Architecture Decision Records

| ADR | Decision | Status |
|---|---|---|
| [[0001-modular-monolith]] | Modular monolith architecture | Accepted |
| [[0002-postgresql]] | PostgreSQL database | Accepted |
| [[0003-managed-oidc]] | Managed OIDC authentication | Accepted |
| [[0004-hosted-payment-checkout]] | Stripe hosted checkout | Proposed → **Accepted (Stripe, mock until keys)** |
| [[0005-payload-cms]] | Payload CMS for public content | Proposed |
| [[0006-rest-openapi]] | REST + OpenAPI | Accepted |
| [[0007-drizzle-orm]] | Drizzle ORM | Accepted |
| [[0008-pino-logging]] | Pino structured logging | Accepted |
| [[0009-email-provider]] | Email delivery vendor | Proposed |
| [[0010-rpo-rto]] | RPO 24h / RTO 4h | Proposed |

## 🚑 Runbooks

- [[database-restore]] — RPO 24h / RTO 4h restore procedure
- [[production-outage]] — outage detection & response
- [[payment-webhook-failure]] — Stripe webhook replay & reconciliation
- [[security-incident]] — Highly Restricted data incident flow
- [[account-lockout]] — MFA lockout recovery

## 🧩 Module Map (apps/api/src/modules — 19 modules, `a2b7e34` → `3347255`)

| Domain | Module | Key permission |
|---|---|---|
| People | people, tags, custom-fields, directory | people.read / write / export, directory.read |
| Households | households | households.read / write |
| Groups | groups | groups.read / manage |
| Events | events (+ recurrence `?occurrences`), calendar (iCal) | events.manage |
| Forms | forms (versioned, export `F-08`) | forms.manage |
| Giving | giving (Stripe adapter) + statements (G-12) | giving.read / manage / export |
| Communications | communications (mock email, opt-out) | communications.send |
| Care | care (prayer + cases) — Highly Restricted | care.read / write, prayer.read |
| Scheduling | scheduling (volunteers) | scheduling.manage |
| Facility | facility (rooms/reservations) | facility.read / manage |
| Worship | worship (songs/services) | worship.read / manage |
| Check-in | checkin (pickup codes, capacity) | checkin.operate |
| Background checks | backgroundchecks (adapter) | backgroundcheck.read / manage |
| Ops | audit + audit viewer, users (provisioning), dashboard | audit.read, admin.users |
| Reporting/Import | reporting, import | people.export, giving.export |
| Observability | pino + `x-request-id` | — |

## 🗺️ Roadmap Snapshots

- **Main:** `3347255` — 26 squash merges from `06641dd`, 17 migrations (`0000`→`0017`), 102 tests (domain 6, auth 5, api 91)
- **Milestones:** M0 Foundation ✅ · M1 Staff Directory ✅ (API) · M2 Digital Front Door 🔶 (CMS types, Next.js shell) · M3 Engagement ✅ (groups, events, forms, comms) · M4 Giving ✅ (mock Stripe + manual/refunds/statements) · M5 Production Readiness ✅ (pino, runbooks, RPO/RTO)
- **Next:** **Member Portal** (this note) → Payload CMS install (D) → remaining G-08 donor matching polish → H-06 bounce webhooks

## 📋 Active Phase — Member Portal (blueprint §5.7)

> See [[member-portal]] for the full spec, API surface, and UI plan. This MOC tracks the portal as the PWA-ready member UI that consumes the APIs above.

- Portal consumes: `people` (self), `households`, `groups`, `events` (register), `forms`, `giving` (history + `statements`), `directory` (opt-in)
- Auth: OIDC `personId` claim + `directory.read`/`giving.read` self-service
- Tech: `apps/web/app/portal/**` (Next.js), later PWA installable

## 🔧 Conventions in this vault

- ADRs live in `docs/adr/` — number-prefixed, immutable once Accepted
- Runbooks live in `docs/runbooks/` — update after every incident
- `docs/notes/` is the working scratchpad — link freely with `[[...]]`
- Never paste real congregant data into notes ([[AGENTS]] rule)
