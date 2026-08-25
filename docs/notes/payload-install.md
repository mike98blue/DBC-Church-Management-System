---
tags: [spec, cms, payload, blueprint-D]
---

# Payload CMS Install — D-01

> Turns the `apps/cms` scaffold (typed interfaces) into a live Payload CMS with admin UI. See ADR 0005.

## Collections (from `apps/cms/src/collections.ts` — now live Payload collections)

| Collection | Purpose | Fields |
|---|---|---|
| `pages` | Public website pages | title, slug, content, seo |
| `ministries` | Ministry content | name, slug, description, leaderIds |
| `staffProfiles` | Staff bios | name, role, bio, photo, order |
| `sermonSeries` | Sermon series | title, slug, description |
| `speakers` | Speakers | name, bio |
| `sermons` | Sermons | title, slug, date, series, speaker, scripture, video |
| `announcements` | Announcements | title, body, dates |
| `navigation` | Navigation menus | items (label, href, children) |
| `redirects` | Redirects | from, to, type |

## Boundaries (ADR 0005)

- Events come from `events` domain (`apps/api`), not CMS
- Groups use public projection from `groups` domain
- Giving pages are ChurchOS pages that start Stripe Checkout

## Install Steps

```bash
pnpm --filter @churchos/cms add payload @payloadcms/db-postgres @payloadcms/next
# payload.config.ts: import { buildConfig } from 'payload'; export default buildConfig({ collections: [...] })
pnpm --filter @churchos/cms dev # admin at http://localhost:3002/admin
```

## Vault Links

- [[0005-payload-cms]] — ADR
- [[HOME]] — module map
