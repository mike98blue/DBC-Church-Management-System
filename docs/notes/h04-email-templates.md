---
tags: [spec, communications, H-04]
---

# H-04 Email Templates

> `templates` table already exists (migrations `0005`), but the API only has `communications.send` (group email with raw subject/body). This adds template CRUD + rendering.

## API (planned)

- `POST /api/v1/communications/templates` (`communications.send`) — create `{ name, subject, body }` with `{{variable}}` interpolation
- `GET /templates` — list
- `POST /send` gains `templateId` + `variables: Record<string,string>` — renders `subject`/`body` via `{{key}}` replacement
- `bounce`/`unsubscribe` already handle opt-out

## Rendering

Simple `{{variable}}` replacement — no heavy templating engine for MVP. Later: `email-templates` package with MJML.

## Links

- [[HOME]] — comms module
- `packages/db/src/schema/communications.ts` — `templates` table
