# ADR 0006: REST with OpenAPI for the Application API

Status: Accepted
Date: 2026-08-23

## Context

The API must serve the website, member portal, staff admin, and future
clients (kiosks, mobile, integrations). The contract must be discoverable
and type-safe for frontend consumers.

## Decision

Use REST under `/api/v1/` with OpenAPI generated from source.

Conventions:

- UUID identifiers
- Cursor/offset pagination on list endpoints
- Consistent error envelope
- Validation at the boundary (never trust the client)
- Authorization enforced at the service boundary, not in controllers alone
- Request IDs on every response
- Idempotency keys for sensitive commands (payments, imports)
- Versioned via URL path (`/api/v1/`)
- ORM models are never exposed directly as API contracts

## Alternatives considered

- **GraphQL**: Powerful but adds caching, auth-scoping, and complexity costs
  not justified for the MVP client count. Revisit if client diversity grows.
- **tRPC**: Excellent DX but couples clients to TypeScript server internals;
  weaker fit for third-party/kiosk clients.

## Consequences

- ✅ Broad client compatibility
- ✅ Generated typed client (packages/api-client) for first-party frontends
- ⚠️ More boilerplate than tRPC for internal screens

## Security/privacy impact

High. Rate limiting on public endpoints; negative authorization tests are
mandatory for sensitive routes.

## Revisit when

A second API style is justified by concrete client needs.
