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
| [[0004-hosted-payment-checkout]] | Stripe hosted checkout | Proposed |
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

## 🧩 Module Map (apps/api/src/modules)

| Domain | Module | Key permission |
|---|---|---|
| People | people, tags, custom-fields | people.read / people.write |
| Households | households | households.read / write |
| Groups | groups | groups.read / manage |
| Events | events (+ recurrence), calendar (iCal) | events.manage |
| Forms | forms (versioned) | forms.manage |
| Giving | giving (Stripe adapter) | giving.read / manage / export |
| Communications | communications (mock email) | communications.send |
| Care | care (prayer + cases) — Highly Restricted | care.read / write, prayer.read |
| Scheduling | scheduling (volunteers) | scheduling.manage |
| Facility | facility (rooms/reservations) | facility.read / manage |
| Worship | worship (songs/services) | worship.read / manage |
| Check-in | checkin (pickup codes) | checkin.operate |
| Background checks | backgroundchecks (adapter) | backgroundcheck.read / manage |
| Ops | audit + audit viewer, users (provisioning) | audit.read, admin.users |

## 🗺️ Roadmap Snapshots

- **Milestones:** M0 Foundation ✅ · M1 Staff Directory ✅ (API) · M2 Digital Front Door 🔶 (CMS pending) · M3 Engagement 🔶 · M4 Giving 🔶 (mock provider) · M5 Production Readiness 🔶
- **Open epics:** Payload CMS install (D), real email vendor ([[0009-email-provider]]), giving page UI (G-02), statements (G-12), refunds (G-13), bounce webhooks (H-06), member portal UI, C-12 dedupe

## 🔧 Conventions in this vault

- ADRs live in `docs/adr/` — number-prefixed, immutable once Accepted
- Runbooks live in `docs/runbooks/` — update after every incident
- Never paste real congregant data into notes ([[AGENTS]] rule)
