# ADR 0003: Managed OpenID Connect Authentication

Status: Accepted
Date: 2026-08-23

## Context

ChurchOS needs authentication for staff, volunteers, and members. Options include building auth from scratch, using OAuth providers, or managed identity services.

## Decision

Use a **managed OpenID Connect (OIDC) provider** for all authentication. Requirements:

- MFA for staff/admin accounts
- Account recovery flows
- Secure session management
- Email verification
- Brute-force protection
- OIDC/OAuth standards compliance
- Future support for Google Workspace, social logins

Do not build password storage, password-reset infrastructure, or MFA from scratch - these are security-critical commodities.

## Alternatives considered

- **Custom auth**: High risk, many security pitfalls, ongoing maintenance burden
- **Firebase Auth**: Good for consumer apps, less ideal for church organizational structure
- **Auth0/Okta**: Strong options but may add cost; manage within church budget
- **Azure AD**: If church already has Microsoft 365, leverage existing identity

## Consequences

- ✅ Reduced security surface area (managed provider handles password hashing, MFA, breach detection)
- ✅ Standardized auth experience across all church digital properties
- ✅ Future-proof for social login, SSO requirements
- ✅ Compliant with security best practices
- ⚠️ Dependency on external provider (mitigated with fallback procedures)
- ⚠️ Cost consideration for hosted OIDC service

## Security/privacy impact

High - authentication is the gateway to all congregation data. MFA on admin accounts is non-negotiable.

## Revisit when

Consider if church requires custom federation, multi-denominational support, or specific compliance certifications.