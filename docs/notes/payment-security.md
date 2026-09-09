---
tags: [security, giving, stripe]
status: draft
---

# Payment Security

- Stripe signed webhooks are authoritative.
- Raw card data must never enter ChurchOS.
- Webhook event IDs are unique and processed transactionally.
- Unmatched donors and funds enter reconciliation; never use arbitrary fallback records.
- Persist only allow-listed payment metadata with defined retention.
- Checkout, refunds, reconciliation, and exports are audited.
