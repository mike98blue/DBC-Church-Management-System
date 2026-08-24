# ADR 0010: RPO and RTO

Status: Proposed
Date: 2026-08-23

## Context

Leadership must approve recovery targets (blueprint §19).

## Decision

Propose **RPO 24h, RTO 4h** — daily encrypted backups with point-in-time recovery where supported, quarterly restore tests. These are the defaults in `docs/runbooks/database-restore.md`.

## Alternatives considered

- **RPO 1h**: Requires more frequent backups and cost.
- **RTO 1h**: Requires hot standby.

## Consequences

- Backup retention, storage cost, and restore runbook frequency depend on these.

## Revisit when

Leadership approves or amends the targets (open decision #20).
