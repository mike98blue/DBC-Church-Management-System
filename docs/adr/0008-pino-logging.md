# ADR 0008: Structured Logging with Pino

Status: Accepted
Date: 2026-08-23

## Context

Production needs structured logs with request IDs for debugging and audit (§18).

## Decision

Use `pino` via `@churchos/observability` for all server logs. `requestIdMiddleware` attaches `x-request-id` to every request/response.

## Alternatives considered

- **Winston**: Heavier, similar capabilities.
- **Bunyan**: Less maintained.

## Consequences

- JSON logs in prod, `pino-pretty` in dev.
- Never log Highly Restricted payloads.

## Revisit when

A hosted log platform is selected.
