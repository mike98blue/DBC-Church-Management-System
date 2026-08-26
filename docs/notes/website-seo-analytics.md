---
tags: [spec, website, seo, D-13]
---

# Website SEO, Sitemap & Analytics — D-13/D-15

> Makes the public site discoverable and measurable.

## Implemented

- `apps/web/app/sitemap.ts` — `MetadataRoute.Sitemap` at `/sitemap.xml` (home + 7 public routes, `NEXT_PUBLIC_WEB_URL`)
- `apps/web/app/robots.ts` — `MetadataRoute.Robots` at `/robots.txt` with sitemap pointer
- `apps/web/app/layout.tsx` — `metadataBase` + `openGraph`/`twitter` + `Analytics` component
- `apps/web/components/Analytics.tsx` — `NEXT_PUBLIC_ANALYTICS_DOMAIN` + `NEXT_PUBLIC_ANALYTICS_SRC` (Plausible by default, defer, no cookies if domain unset)
- `apps/web/app/ministries|sermons/page.tsx` — live from `payload` via `lib/cms.ts` (`NEXT_PUBLIC_CMS_URL`)
- `apps/web/app/portal/*` — 7 portal routes live-wired via `lib/api.ts`

## Vault Links

- [[HOME]] — module map now 19 → 20 modules with `scheduling`, `facility`, `worship`, `checkin`
- `apps/web/lib/cms.ts` — CMS fetch
- `apps/web/lib/api.ts` — ChurchOS API fetch
