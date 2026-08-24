# ADR 0007: Drizzle ORM for Schema and Migrations

Status: Accepted
Date: 2026-08-23

## Context

The blueprint requires selecting Prisma or Drizzle before implementation
(Section 1). Database changes are high-risk (Section 23): migrations must be
reviewable SQL, additive by default, and never edited after application.

## Decision

Use **Drizzle ORM** with drizzle-kit for schema definition and migration
generation.

Rationale:

- Migrations are plain SQL files — reviewable in PRs, matching the
  blueprint's migration discipline
- Schema lives in TypeScript close to domain code
- Lightweight runtime with no code-generation step for queries
- SQL-transparent: team members with SQL skills can reason about behavior

## Alternatives considered

- **Prisma**: Excellent DX and docs, but migrations are less SQL-transparent
  and the engine adds operational surface.
- **Raw SQL + node-pg-migrate**: Maximum control, more boilerplate.

## Consequences

- ✅ Reviewable SQL migrations committed to Git under `packages/db/drizzle/`
- ✅ No binary engine dependency
- ⚠️ Fewer batteries included than Prisma; team writes more explicit queries
- ⚠️ Relations API requires discipline

## Security/privacy impact

Medium. SQL transparency aids review of data access. Parameterized queries
via Drizzle prevent injection by default.

## Revisit when

A concrete need (e.g., complex reporting ORM ergonomics) justifies change.
