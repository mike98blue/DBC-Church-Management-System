# Contributing to ChurchOS

## Ground rules

1. Read `AGENTS.md` before modifying code — it applies to humans and AI alike.
2. Read relevant ADRs in `docs/adr/`. Do not silently contradict an accepted ADR.
3. No real congregant data, ever. Synthetic fixtures only (`Alex Example`, `Jordan Example`, ...).
4. Never commit secrets. Use `.env` locally (gitignored) and document new variables in `.env.example`.

## Workflow

1. Pick an issue from the backlog (Epics A–I, organized by milestone).
2. Branch from `main`: `feature/123-short-description`, `fix/245-short-description`.
3. Make the change with tests (success, failure, and permission-denied cases for anything sensitive).
4. Run the quality gates locally:

   ```text
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

5. Open a PR using the template. Link the issue.
6. Squash-merge. `main` history should stay readable.

## Branch protection

`main` is protected. Work lands through pull requests with required CI checks.

## Database changes

- Generate a new migration (`pnpm db:generate`); never edit an applied one.
- Prefer additive, backward-compatible changes.
- Destructive changes require explicit review and an explanation in the PR.

## Sensitive domains

PRs touching auth, permissions, giving, migrations, children, pastoral care,
or infrastructure require review by the repository owner regardless of who
(or what AI) wrote the code.
