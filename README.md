# Congress.Watch

Congress.Watch is a source-linked civic website for tracking current members of Congress, their votes, and their legislation with a restrained, editorial UI inspired by the saved product mockups.

## What’s here

- Next.js 16 App Router frontend with desktop and mobile-friendly layouts
- Current-member directories for the House, Senate, and all 50 state delegations
- Member profile pages, vote detail pages, bill detail pages, search, methodology, and data-source pages
- Hybrid official-source data layer:
  - live House roster from the Clerk XML feed
  - live Senate roster from Senate XML feeds
  - live recent House and Senate votes when available
  - official-source-backed seeded fallback for bills and votes when Congress.gov API credentials are unavailable
- API routes for homepage, state, member, bill, vote, and refresh data access
- Tests for derived data and official-source parsing
- Project docs, copied PRDs, and saved UI reference images in [docs](/Users/sposato/Dev_Projects/Congress_Watch/docs)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify locally

```bash
npm run lint
npm run test
npm run build
npm run congress:sync -- --mode hybrid
```

## Data notes

- `bioguide_id` is treated as the durable member identity when available.
- The app is intentionally current-members-only for V1.
- When a live upstream source is unavailable or an API key is missing, the app degrades to committed official-source-backed seed data instead of failing closed.

## Key project files

- [AGENTS.md](/Users/sposato/Dev_Projects/Congress_Watch/AGENTS.md)
- [docs/project-memory.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/project-memory.md)
- [docs/congress-transparency-prd.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-transparency-prd.md)
- [docs/congress-data-architecture.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-data-architecture.md)
- [docs/congress-sitemap-ux-spec.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-sitemap-ux-spec.md)
- [docs/ui-references/README.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/ui-references/README.md)
