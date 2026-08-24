# Security Policy

ChurchOS handles sensitive congregant data: contact information, attendance,
giving, children's records, and (later) pastoral care notes.

## Reporting a vulnerability

Email the repository owner directly, or open a private security advisory via
GitHub: **Security → Report a vulnerability**.

Please do not open public issues for security problems.

## What we will do

- Acknowledge within 3 business days
- Triage severity and communicate a remediation plan
- Patch and disclose responsibly after a fix ships

## Ground rules for reporters

- Use only synthetic or your own test data
- No production data probing
- No denial-of-service testing

## Sensitive domains

Changes to these areas require human review before merge:

- authentication and authorization
- giving/payments
- database migrations
- children's check-in
- pastoral care
- production infrastructure
