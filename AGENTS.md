# Congress.Watch AGENTS.md

## Project Identity

- Product name: `Congress.Watch`
- Mission: Help the public understand what current members of Congress are actually doing using source-linked, nonpartisan, current-member-focused data.
- Core positioning: Presidents dominate headlines. Congress makes the law.

## Primary Source Of Truth

Before making product or implementation changes, align with these local files:

- [docs/congress-transparency-prd.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-transparency-prd.md)
- [docs/congress-data-architecture.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-data-architecture.md)
- [docs/congress-sitemap-ux-spec.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-sitemap-ux-spec.md)
- [docs/ui-references/README.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/ui-references/README.md)
- [docs/project-memory.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/project-memory.md)

If these documents conflict, use this order:

1. Data accuracy and source integrity from the data architecture doc
2. Product scope and principles from the PRD
3. Route and page requirements from the sitemap and UX spec
4. Visual direction from the UI reference images

## Non-Negotiable Product Rules

- Cover current members only for V1.
- Prefer official government sources whenever possible.
- Preserve provenance for every important fact.
- Never invent member-level vote positions.
- Never present AI output as source truth.
- Label AI-generated text as `AI-assisted`.
- Avoid partisan, persuasive, or evaluative language.
- Missing, delayed, or incomplete data must be labeled clearly.

## Data Rules

- `bioguide_id` is the preferred durable member identifier when available.
- Member identity must be separate from seat or term identity.
- Store raw source references and source URLs alongside normalized records.
- Imports must be idempotent.
- Do not delete good existing data because of transient upstream failures.
- Show stale data with timestamps instead of hiding pages where feasible.

## UX Rules

- The site should feel editorial, civic-minded, and trustworthy.
- Keep red and blue accents balanced and subdued.
- Prioritize readability over dashboard density.
- Header navigation should align to MVP routes from the sitemap:
  - `/`
  - `/states`
  - `/states/[stateSlug]`
  - `/house`
  - `/senate`
  - `/members/[memberSlug]`
  - `/votes`
  - `/bills`
  - `/search`
  - `/methodology`
  - `/data-sources`
  - `/about`
- Mobile state browsing is part of MVP and must be treated as first-class.

## Implementation Guidance

- Prefer App Router server components unless a client component is necessary.
- Keep domain logic in `src/lib`.
- Keep ingestion and refresh logic in `scripts/` and `src/app/api/` where appropriate.
- Keep UI composition and route rendering in `src/app` and `src/components`.
- Tests should cover domain transforms, derived stats, and critical page or API behavior.

## Deployment And Operations

- V1 must remain usable even if premium or authenticated upstream APIs are unavailable.
- If an official API key is missing, provide graceful fallback behavior with seeded official-source-backed data.
- Scheduled refresh design should follow the documented cadence:
  - roster daily
  - votes hourly during activity
  - bills every 6 hours
  - committees daily if included
- Track import runs and expose last-updated timestamps in the UI.

## Session Continuity

- Update [docs/project-memory.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/project-memory.md) whenever a major architectural, data, or deployment decision changes.
- Treat `project-memory.md` as the handoff document for future sessions.
- Add durable notes there instead of leaving key decisions only in chat history.
