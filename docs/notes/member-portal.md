---
tags: [spec, portal, phase3]
---

# Member Portal — ChurchOS §5.7

> PWA-ready member UI that lets congregants manage **self-service** data that staff otherwise handle. All APIs already exist; this note is the build spec for `apps/web/app/portal/**`.

## Goals (blueprint §5.7)

A logged-in member can:

- [ ] View/update **own contact info** (`PATCH /api/v1/people/:id` — self-service via `personId` claim)
- [ ] Manage **communication preferences** (`communication_preferences`)
- [ ] View **household** they belong to (`GET /households/:id`, `personId` scoping)
- [ ] View **groups** they belong to (`GET /groups?personId=`)
- [ ] View **upcoming public events** (`GET /events` + `?occurrences=true`) and **register** (`POST /events/:id/registrations`)
- [ ] Submit **forms** (`POST /forms/:id/submissions`)
- [ ] View **giving history** (`GET /giving/contributions?donorId=`) and **download statements** (`GET /giving/statements/:donorId?startDate&endDate`)
- [ ] View **directory** entry and edit own `directory_preferences` (`GET/PUT /directory/preferences/:personId`)
- [ ] View **serving opportunities** (groups with `volunteer_team` type — later)

## API Surface Already Built

| Portal need | Endpoint | Perm |
|---|---|---|
| Own person | `PATCH /people/:id` | `people.write` (self via `personId`) |
| Household | `GET /households/:id` | `households.read` |
| Groups | `GET /groups` + `GET /groups/:id/members` | `groups.read` |
| Events | `GET /events`, `GET /events?occurrences` | public |
| Register | `POST /events/:id/registrations` | public |
| Forms | `GET /forms/:id`, `POST /forms/:id/submissions` | public / `forms.submit` |
| Giving history | `GET /giving/contributions` | `giving.read` |
| Statements | `GET /giving/statements/:donorId` | `giving.export` (self) |
| Directory | `GET /directory` | `directory.read` |

See [[HOME]] module map for full perms.

## UI Plan (`apps/web/app/portal/**`)

```
app/portal/
  layout.tsx — auth guard (OIDC), nav (Profile | Household | Groups | Events | Giving)
  page.tsx — dashboard (upcoming events + recent giving)
  profile/page.tsx — person form (first/preferred/last, contact)
  household/page.tsx — household card + members
  groups/page.tsx — member's groups
  events/page.tsx — public events + occurrence expansion
  giving/page.tsx — history table + statement download
  directory/page.tsx — opt-in toggle + preview
```

- Auth: `OidcAuthGuard` already reads `personId` from `sub`/`personId` claim; portal layout checks it.
- Data fetching: Next.js `fetch` against `http://localhost:4000/api/v1/...` with `Authorization: Bearer <token>` (in dev, mock header `x-mock-permissions` + `x-mock-user`).
- PWA: `next-pwa` in a follow-up — portal is already responsive, just needs `manifest.json` + offline cache.

## Tasks

- [x] Scaffold `apps/web/app/portal/**` routes + `portal/layout.tsx` (auth)
- [x] Add `portal/giving/manual` + `refund` (G-10/G-13)
- [x] Wire `portal/profile` and `admin/people` to live API via `lib/api.ts` (`NEXT_PUBLIC_API_URL`, `Authorization: Bearer`)
- [x] Wire `portal/household`, `groups`, `events` (`?occurrences`), `giving`, `directory` via `apiFetch` (live when API running, fallback placeholder when not)
- [x] Make `apps/web` public `ministries`/`sermons` live from Payload (`lib/cms.ts`, `NEXT_PUBLIC_CMS_URL`, `/api/ministries`, `/api/sermons`)
- [ ] Add `directory` opt-in toggle + household live fetch
- [ ] Playwright E2E: login (mock) → update profile → register for event → download statement

Wired: `apps/web/lib/api.ts`, `apps/web/lib/cms.ts`, `apps/admin/lib/api.ts` — see `apps/web/app/portal/*` and `apps/web/app/ministries|sermons/page.tsx`.

## Open Decisions

- Directory is `directory.read` today — should unauthenticated visitors see it? (blueprint §46 #11/12 — currently Proposed as opt-in private)
- Giving statements are `giving.export` — should `giving.read` self-service be enough for own donor? (currently `giving.export` for all, self-service via `personId` check is a follow-up)
