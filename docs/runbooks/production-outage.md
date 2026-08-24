# Production Outage Runbook

## Detection

- Uptime monitor (I-04) alerts + error tracking (I-02) + `GET /healthz` failing.

## Steps

1. **Acknowledge** the alert in the on-call channel.
2. **Check** `GET /healthz` and `GET /healthz` with DB probe.
3. **Check** recent deploys in GitHub Actions — roll back the last `main` deploy if it correlates.
4. **Check** DB and object storage health in the cloud console.
5. **Put** the public site in maintenance mode if needed (static fallback).
6. **Restore** from backup per `database-restore.md` if data loss is suspected.
7. **Communicate** status to staff via the comms channel (do not post PII in status messages).
8. **Post-mortem** within 5 business days — update this runbook.
