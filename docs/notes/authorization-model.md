---
tags: [security, authorization]
status: draft
---

# Authorization Model

Authentication comes from managed OIDC. ChurchOS owns identity linkage, active status, permissions, and scope enforcement.

## Rules

- Token claims identify the subject; they do not grant application authority by themselves.
- Every protected service resolves an active ChurchOS user.
- Sensitive resources require an explicit policy check at the service boundary.
- Care, children, giving, exports, and user administration require audit events.
- Missing scope is deny-by-default.
