# ADR 0002: PostgreSQL Database

Status: Accepted
Date: 2026-08-23

## Context

ChurchOS needs a relational database for people, households, groups, events, giving, and administrative data.

## Decision

Use **PostgreSQL** as the primary database. It offers:

- Advanced JSON support for flexible schema needs
- Strong ecosystem of ORMs (Prisma, Drizzle, TypeORM)
- Excellent tooling (pgAdmin, Supabase, Neon)
- Proven reliability for mission-critical data
- Cost-effective hosting options (Supabase, Neon, Railway, AWS RDS)

## Alternatives considered

- **MySQL**: Valid option but PostgreSQL has better JSON support and modern features
- **SQLite**: Not suitable for multi-user church environment
- **MongoDB**: Document store, loses relational integrity for core ministry data (households, giving relationships)

## Consequences

- ✅ Full ACID compliance for financial and membership data
- ✅ Rich querying capabilities for reports and analytics
- ✅ Excellent ORM support with TypeScript
- ✅ Strong ecosystem for backups, migration, and monitoring
- ⚠️ Requires proper migration tooling (Prisma Migrate or Drizzle Kit)

## Security/privacy impact

Medium - database choice affects data encryption, access controls, and backup strategies.

## Revisit when

Consider alternative databases if specific workload requirements emerge (e.g., heavy geospatial data, time-series analytics).