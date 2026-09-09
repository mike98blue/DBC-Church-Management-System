---
tags: [security, remediation, moc]
status: active
---

# ChurchOS Security Remediation

> Release-blocking remediation tracked in Obsidian. Never add secrets or real congregant data.

## Status

- Phase: [[security-remediation-backlog]]
- Release gate: blocked until all Critical and High tasks are complete
- Required review: authentication, authorization, giving, children, pastoral care, migrations, infrastructure

## Workstreams

- [[authorization-model]]
- [[payment-security]]
- [[production-readiness]]
- [[test-coverage-matrix]]

## Release Gates

- [ ] Production rejects unsafe authentication configuration
- [ ] Stripe webhooks are signature verified and idempotent
- [ ] Resource-level authorization is enforced in services
- [ ] Sensitive domains have negative authorization tests
- [ ] Database constraints and transactions are applied via reviewed migrations
- [ ] OpenAPI contract is generated and reviewed
- [ ] Production infrastructure, backup, restore, and monitoring are operational
- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm e2e`
- [ ] `pnpm audit --prod --audit-level high`

## Change Log

- 2026-08-29 — Remediation program opened after full project audit.
