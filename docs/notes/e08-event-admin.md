---
tags: [spec, events, E-08]
---

# E-08 Event Admin — Staff Registrations

> Staff view for `GET /api/v1/events/:id/registrations` and `GET /events/:id/attendance`.

## Routes

- `apps/admin/app/events/[id]/page.tsx` — event detail with registrations table and attendance recording
- `apps/admin/app/events/[id]/attendance/page.tsx` — dedicated attendance recorder

## Permissions

- `events.manage` to list registrations
- `attendance.record` to record

## Links

- `apps/api/src/modules/events/events.service.ts` — `listRegistrations`, `recordAttendance`
