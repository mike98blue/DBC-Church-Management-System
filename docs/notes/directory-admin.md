---
tags: [spec, directory, admin]
---

# Member Directory Admin

> Staff view for `directory_preferences` — search, opt-in audit, bulk export.

## Routes

- `apps/admin/app/directory/page.tsx` — table of `GET /directory` with search `?q=`, opt-in badges
- `apps/admin/app/directory/[id]/page.tsx` — per-person `showInDirectory`/`showEmail` toggles

## Permissions

- `directory.read` to list
- `directory.manage` to toggle others (self-service via `personId` claim already in API)

## Links

- `packages/db/src/schema/directory.ts`
- `apps/api/src/modules/directory/directory.service.ts`
