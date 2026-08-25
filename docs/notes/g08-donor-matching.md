---
tags: [spec, giving, G-08]
---

# G-08 Donor Matching Polish

> Improves the mock donor matching in `GivingService.handleWebhook` from “first person/first fund” to proper email/name matching.

## Current (mock)

- `handleWebhook` picks the first `people` row and first `funds` row — works for dev, but not for real.

## Polish (this note)

- Match donor by Stripe `customer_email` or `metadata.personId` against `people` (email lookup when `person_emails` table lands, or `people` email field)
- Match fund by `metadata.fundId` or `description` → `funds` lookup
- Fallback: create donor + allocate to General fund, log warning
- Add `donorMatching` unit test with mocked DB

## Links

- [[HOME]] — giving module (`giving.read`/`manage`)
- `apps/api/src/modules/giving/giving.service.ts`
