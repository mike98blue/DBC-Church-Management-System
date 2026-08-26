---
tags: [spec, pwa, portal]
---

# PWA Offline — Portal

> Make `apps/web/app/portal` installable and resilient. `manifest.ts` already at `/manifest.webmanifest` (PWA install prompt in `portal/layout.tsx`). Next: service worker for offline reads.

## Plan

- `apps/web/app/sw.ts` already returns a no-op fetch listener — extend to cache `GET /api/v1/...` with `stale-while-revalidate`
- Add `next-pwa` in follow-up when offline write queues are needed
- Test: Chrome DevTools → Application → Offline → portal still renders cached dashboard

## Links

- `apps/web/app/manifest.ts`
- `apps/web/components/PwaInstall.tsx`
