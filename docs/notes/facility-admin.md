---
tags: [spec, facility, admin]
---

# Facility Admin — Calendar

> Staff view for `reservations` with overlap detection.

## Routes

- `apps/admin/app/facility/page.tsx` — table of `GET /facilities/reservations` with starts/ends, 400 on overlap

## Links

- `apps/api/src/modules/facility/facility.service.ts` — `tstzrange` overlap check
