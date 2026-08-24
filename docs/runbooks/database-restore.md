# Database Restore Runbook

**RPO:** 24 hours (daily backups) — leadership to confirm.  
**RTO:** 4 hours — leadership to confirm.

## Prerequisites

- Encrypted backup in object storage (versioned, separate credentials)
- `DATABASE_URL` for target environment
- `psql` or `pg_restore` available

## Steps

1. **Confirm** which backup to restore (timestamp, checksum from import report).
2. **Notify** tech lead and finance rep — giving data is involved.
3. **Stop** API/worker writes to the target DB (maintenance mode).
4. **Restore** to a *new* database first (never overwrite production in place):
   ```text
   pg_restore --verbose --clean --no-acl --no-owner -d $RESTORE_DATABASE_URL backup.dump
   ```
5. **Verify** row counts for `people`, `households`, `contributions` vs import report.
6. **Run** `pnpm --filter @churchos/db db:migrate` if the backup is behind `main`.
7. **Point** `DATABASE_URL` to the restored DB, restart API/worker.
8. **Smoke-test** login, people search, giving history, and a test checkout (mock).
9. **Log** the incident in `audit_events` and update the quarterly restore test log.

## Never do

- Do not restore a backup containing real PII to a dev laptop without de-identification approval.
- Do not use production data as AI input while debugging.
