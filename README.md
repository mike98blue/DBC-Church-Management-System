# ChurchOS

A church-owned digital platform combining:
- Public church website and CMS
- Secure church management system (ChMS)
- Member and household database
- Groups, events, attendance, and volunteer coordination
- Online giving with payment processor integration
- Communications and follow-up workflows
- Member portal (PWA-ready)
- Reporting, exports, audit history, and ministry analytics

## Strategic Philosophy

**Build a strong shared foundation, launch a focused MVP, validate real ministry workflows, and add modules in phases.**

Do not attempt to clone Tithely, Planning Center, Pushpay, Subsplash, or Rock RMS all at once. Instead:

- One canonical people database
- One secure identity model
- One event/calendar source
- One integrated public website
- One member portal
- One giving history linked to people
- Specialized privacy boundaries for finance, children, and pastoral care
- Open APIs
- Automated tests
- Audited data access
- Recoverable backups

## Technology Stack (Baseline)

- **Frontend**: Next.js + TypeScript
- **Staff/admin UI**: Next.js + shared component library
- **Application API**: NestJS
- **Database**: PostgreSQL
- **ORM/Schema**: Prisma or Drizzle (select before implementation)
- **Public content CMS**: Payload CMS
- **Authentication**: Managed OpenID Connect provider
- **Authorization**: Application-owned RBAC and scoped permissions
- **Payments**: Hosted payment provider (Stripe Checkout)
- **Email**: Managed transactional email service
- **SMS**: Managed messaging provider (Phase 2)
- **File storage**: S3-compatible object storage
- **Background jobs**: Managed queue + worker process
- **Testing**: Vitest + Playwright
- **Observability**: OpenTelemetry + hosted error/log platform
- **CI/CD**: GitHub Actions
- **Infrastructure as code**: OpenTofu
- **Source control**: GitHub organization repository with protected `main`

## First Production Release Focus

- Identity and access control
- People and households
- Groups and ministry teams
- Events and attendance
- Website and CMS
- Forms
- Email communications
- Giving integration and donor records
- Reporting and exports
- Audit logs
- Data import/migration
- Security, backup, restore, and operational monitoring

Children's check-in included only if church intends to replace existing system at launch.

## Quick Start

Prerequisites: Node.js 22+ and pnpm (`npm install -g pnpm`). Docker for the local database.

```text
pnpm install                 # install dependencies
docker compose up -d         # start local PostgreSQL
cp .env.example .env         # local env defaults
pnpm db:migrate              # apply migrations
pnpm db:seed                 # load synthetic seed data (never real PII)
pnpm dev                     # run apps in watch mode
```

API health check: `http://localhost:4000/healthz`

## Quality gates (required before every PR)

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See `AGENTS.md` for AI operating rules and `CONTRIBUTING.md` for the workflow.

## Documentation

- `BLUEPRINT.md` - full product and engineering blueprint (research + plan)
- `AGENTS.md` - AI operating rules and scope
- `CONTRIBUTING.md` - contribution workflow
- `SECURITY.md` - security policy and sensitive domains
- `docs/adr/` - architecture decision records
- `.github/` - workflows, issue/PR templates, CODEOWNERS