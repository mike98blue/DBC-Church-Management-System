---
tags: [security, remediation, backlog]
status: active
---

# Security Remediation Backlog

## Phase 0: Freeze Risk

- [x] SEC-AUTH-01 Gate unsigned authentication to explicit local development only
- [x] SEC-AUTH-02 Fail startup for incomplete production OIDC configuration
- [x] SEC-PAY-01 Fail startup when live payment webhooks lack verification
- [x] SEC-OPS-01 Block production deployment with startup config gate

## Phase 1: Identity and Authorization

- [x] SEC-AUTH-03 Resolve OIDC subjects to active application users
- [x] SEC-AUTH-04 Load permissions from application-owned role records
- [x] SEC-AUTH-05 Add resource policies for self/organization-scoped reads (statements self vs org, availability ownership)
- [x] SEC-AUTH-06 Add negative authorization tests for sensitive routes (expanded statements tests)

## Phase 2: Giving

- [x] SEC-PAY-02 Implement Stripe signature verification with raw request body
- [x] SEC-PAY-03 Remove arbitrary donor/fund fallbacks
- [x] SEC-PAY-04 Make webhook processing transactional and duplicate-safe
- [x] SEC-PAY-05 Make refunds retry-safe and audited
- [x] SEC-PAY-06 Minimize payment payload retention

## Phase 3: Sensitive Domains

- [x] SEC-DATA-01 Protect private and unpublished forms
- [x] SEC-DATA-02 Separate prayer permissions and audit care access
- [x] SEC-DATA-03 Enforce child/event existence checks for check-in
- [x] SEC-DATA-04 Minimize and protect pickup-code exposure

## Phase 4: Integrity and Contracts

- [x] SEC-DATA-05 Add reviewed database constraints and migrations
- [x] SEC-API-01 Validate command DTOs and relationships (event registration, communications recipients)
- [x] SEC-API-02 Add generated OpenAPI contract and serve endpoint
- [x] SEC-API-03 Add idempotency key validation and bounded pagination (audit viewer already bounded; import requires key)

## Phase 5: Abuse and Delivery

- [x] SEC-ABUSE-01 Add per-route rate limiting with pluggable shared store and proxy-safe client key
- [x] SEC-COMMS-01 Validate recipients and deliver to all recipients
- [x] SEC-EXPORT-01 Harden CSV serialization against formula injection
- [x] SEC-AUDIT-01 Make sensitive audit events durable and audited (giving refunds/manual, care/prayer)

## Phase 6: Operations

- [x] SEC-OPS-02 Implement production network, encrypted DB, and secret management scaffold
- [x] SEC-OPS-03 Document automated backup and restore verification (runbook + audit requirement)
- [x] SEC-OPS-04 Add production infrastructure scaffold and deployment readiness checks
- [x] SEC-OPS-05 Remediate dependency vulnerabilities — Next.js (critical), qs, and Payload (3.89.0-internal.4b0e9b6) fixed; 0 vulnerabilities

## Completion Rule

No task is complete without code review, tests, documentation, and a linked validation result.
