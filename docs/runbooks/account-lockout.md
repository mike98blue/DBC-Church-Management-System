# Account Lockout Runbook

For staff/admin accounts with MFA (ADR 0003).

## Symptoms

- MFA failure, brute-force lock, or OIDC provider outage.

## Steps

1. **Verify** the user’s identity via a second channel (phone, in-person).
2. **Check** the OIDC provider’s admin console for lockouts and brute-force blocks.
3. **Unlock** or reset MFA per the provider’s documented flow — never share recovery codes in chat.
4. **Review** `audit_events` for failed logins around the lockout time.
5. **Document** the recovery in the access review report (B-10).
