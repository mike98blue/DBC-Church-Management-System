# ADR 0001: Modular Monolith Architecture

Status: Accepted
Date: 2026-08-23

## Context

The church needs a ChMS and website platform. Options include building a custom system, using SaaS solutions (Tithely, Planning Center, Pushpay), or Rock RMS (open source).

## Decision

Adopt a **modular monolith** architecture with one deployable API, one canonical relational database, and clear internal modules. This provides service-oriented benefits while remaining understandable to a mixed-experience team.

Do not begin with microservices - they add service discovery, distributed tracing, inter-service authorization, duplicated pipelines, data consistency problems, harder local development, and harder onboarding.

Move a module to a service only if real scale or reliability data later justifies it.

## Alternatives considered

- **Microservices**: Too complex for initial development, adds unnecessary overhead
- **SaaS platforms (Tithely, Planning Center)**: Ongoing costs, less data ownership, integration limitations
- **Rock RMS**: Open source but requires self-hosting, security responsibility, and operational expertise

## Consequences

- ✅ Simpler local development and onboarding
- ✅ Single deployment pipeline
- ✅ Easier data consistency
- ✅ Clear module boundaries within one codebase
- ⚠️ May need to refactor to services later if scale requires it
- ⚠️ Single point of failure (mitigated with proper DB/backup strategy)

## Security/privacy impact

Low - architectural decision, no direct data exposure changes.

## Revisit when

Consider service extraction if the system exceeds 100k concurrent users or requires independent scaling of specific modules.