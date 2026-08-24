# ChurchOS - AI Operating Rules

## Before modifying code

1. Read `README.md`.
2. Read `AGENTS.md`.
3. Read relevant ADRs.
4. Read the nearest path-specific `AGENTS.md` if present.
5. Inspect the code around the requested change.
6. Inspect tests for that module.
7. Inspect the current database schema before proposing schema changes.
8. Inspect the OpenAPI contract before inventing routes or fields.
9. Search the repository before creating a new abstraction.
10. State a short implementation plan.

## Scope

- Implement only the issue requested.
- Do not perform unrelated refactors.
- Do not rename public APIs without explicit instruction.
- Do not replace a dependency merely because another library is preferred.
- Keep pull requests reviewable.

## Security

- Never add secrets.
- Never output or commit `.env` credentials.
- Never use real congregant PII in tests, fixtures, screenshots, or prompts.
- Treat giving, children, pastoral care, and authentication as sensitive domains.
- Enforce authorization server-side.
- Never rely on hidden UI controls as authorization.
- Never weaken security to make tests pass.
- Never disable validation globally.
- Never log access tokens, passwords, raw payment data, or pastoral notes.

## Data model

- Never invent a column or relation without checking the schema.
- Never change an applied migration.
- Generate a new migration.
- Prefer additive backward-compatible migrations.
- Explain destructive operations.
- Keep data migrations restartable and idempotent where practical.

## External APIs

- Do not invent provider endpoints, request fields, event names, or webhook payloads.
- Verify against vendor documentation or existing integration code.
- Isolate external providers behind adapters.
- Handle timeouts and retries.
- Verify webhook signatures.
- Make webhook consumers idempotent.

## Tests

For each behavioral change:
- add or update unit tests
- add integration tests when database/API behavior changes
- add E2E coverage for critical user flows
- include negative authorization tests
- test failure states
- run the documented validation commands

## Documentation

Update documentation when changing:
- architecture
- environment variables
- API contracts
- database model
- security behavior
- operational process

Create or update an ADR for architectural changes.

## Completion

Before claiming completion:
1. Review the diff.
2. Ensure no unrelated files changed.
3. Run formatter.
4. Run lint.
5. Run type check.
6. Run tests.
7. Run build.
8. Report any command that could not be run.
9. Summarize security/data implications.
10. Provide migration/deployment notes.

### AI must never merge its own sensitive change

Changes involving auth, permissions, giving, migrations, children, pastoral care, or production infrastructure require human review.