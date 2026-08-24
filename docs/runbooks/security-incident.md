# Security Incident Runbook

For Highly Restricted data (pastoral, children, finance, auth).

## Immediate

1. **Contain** — rotate the affected credential/secret, revoke the session, or take the app offline if needed.
2. **Preserve** logs (do not delete `audit_events`).
3. **Notify** the security owner and tech lead within 1 hour.

## Investigation

- Scope: which `audit_events` and `people`/`donors` records were accessed?
- Never log raw tokens, card data, or pastoral notes (AGENTS.md).

## Recovery

- Rotate all potentially exposed secrets, force re-auth for affected users, and require MFA reset for staff.
- Patch, then verify with `pnpm audit` and dependency scan.

## Communication

- Follow the church’s incident communication policy — do not disclose PII in public channels.
- Document the incident and update `SECURITY.md` if needed.
