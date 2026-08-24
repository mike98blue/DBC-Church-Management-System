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

See `AGENTS.md` for AI operating rules, development onboarding, and contribution guidelines.

## Documentation

- `AGENTS.md` - AI operating rules and scope
- `CODEOWNERS` - GitHub code ownership
- `docs/adr/` - Architecture decision records
- `docs/runbooks/` - Operational runbooks
- `.github/` - GitHub workflows and templates