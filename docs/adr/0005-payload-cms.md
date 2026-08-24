# ADR 0005: Payload CMS for Public Website Content

Status: Proposed
Date: 2026-08-23

## Context

The public website needs a content management capability that non-developers
can operate. Building a CMS editor from scratch is a commodity capability the
blueprint says to integrate rather than build (Section 43).

## Decision

Use Payload CMS (self-hosted, TypeScript-native) for public content:
pages, ministries, staff profiles, sermons, series, speakers, announcements,
navigation, redirects, and media assets.

Boundaries:

- Events come from the ChurchOS events domain, not CMS content.
- Groups shown publicly come from the groups domain via a public projection.
- Giving pages are ChurchOS pages that start a hosted checkout session.
- CMS roles (editor, publisher) are separate from ChMS roles — CMS access
  never grants ChMS administrative access.

## Alternatives considered

- **WordPress**: PHP stack mismatch, plugin security surface.
- **Sanity/Contentful**: Hosted SaaS, ongoing per-seat costs, data residency.
- **Custom CMS**: High cost, security burden, slow iteration.

## Consequences

- ✅ Non-developers can publish approved content
- ✅ TypeScript alignment with the rest of the platform
- ✅ Self-hosted; content stays in church-controlled storage/DB
- ⚠️ Another deployable app (apps/cms) to operate
- ⚠️ Version upgrades require maintenance attention

## Security/privacy impact

Medium. Public content only in CMS; no confidential congregant data in CMS
collections. Draft/publish workflow prevents accidental publication.

## Revisit when

Content team size changes, or a hosted headless CMS becomes cost-effective.
