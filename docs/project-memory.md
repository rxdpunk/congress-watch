# Congress.Watch Project Memory

## Project Summary

Congress.Watch is a civic data website focused on current members of the U.S. House and Senate. It is designed to help users answer:

- Who represents me right now?
- What has this member actually done?
- How has this person voted and how often do they participate?

## Current Working Inputs

- Product brief: [congress-transparency-prd.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-transparency-prd.md)
- Data architecture: [congress-data-architecture.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-data-architecture.md)
- Sitemap and UX: [congress-sitemap-ux-spec.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/congress-sitemap-ux-spec.md)
- UI references: [ui-references/README.md](/Users/sposato/Dev_Projects/Congress_Watch/docs/ui-references/README.md)

## Product Decisions

- V1 is current-members-only.
- The product must be factual, source-linked, and nonpartisan.
- AI content is derived output only and must be labeled `AI-assisted`.
- The primary MVP route structure should follow the sitemap spec under `/states`, `/members`, `/votes`, `/bills`, `/search`, `/methodology`, `/data-sources`, and `/about`.

## Data Decisions

- PostgreSQL is the target database architecture for a production path.
- The key normalized entities are members, member terms, bills, bill actions, bill sponsorships, votes, vote positions, source documents, import runs, and AI summaries.
- `bioguide_id` is the preferred canonical member identity key when available.
- Every important record should preserve source provenance.
- Imports should be idempotent and should not destroy valid existing data on upstream failure.

## Operations Decisions

- Refresh cadence target:
  - member roster daily
  - bills every 6 hours
  - House and Senate votes hourly during activity
  - committees daily if included
- Frontend pages should surface last-updated or stale-data signals.
- If required official API credentials are unavailable, the deployed site should fall back gracefully to seeded official-source-backed data rather than breaking.

## UI Decisions

- The design target is the saved civic dashboard mockups in `docs/ui-references`.
- Visual language should be editorial, restrained, and trustworthy.
- Mobile state browsing is a first-class experience, not an afterthought.

## Delivery Goal

- Standalone Git repository for this project
- Pushed to GitHub
- Deployable and deployed on Vercel
- Tested with lint/build and functional verification

## Current Delivery State

- GitHub repository: [rxdpunk/congress-watch](https://github.com/rxdpunk/congress-watch)
- Production site: [congress-watch.vercel.app](https://congress-watch.vercel.app)
- Vercel project scope: `illumios`
- Production deploy model: direct Vercel CLI deployment
- Automated refresh: Vercel cron calls `/api/refresh` hourly to warm live-data caches

## Deployment Notes

- The Vercel project is linked locally and deploys successfully.
- GitHub auto-linking inside Vercel is not yet active because the Vercel account does not currently have a GitHub login connection configured for one-click repo linking.
- This does not block production use; it only means deploys are currently CLI-driven instead of Git-push-triggered from Vercel.

## Open Risks

- Official data source availability and authentication requirements may affect how much live data can be pulled automatically in V1.
- Committee coverage may need to ship as partial or deferred functionality if the source path proves brittle relative to the rest of MVP.

## Latest Session Focus

- Replace placeholder repo guidance with a real project `AGENTS.md`
- Build a functional V1 site from the PRD, data architecture, sitemap, and reference images
- Add durable project memory for future sessions
- Publish the repo to GitHub and deploy the site to Vercel
- Fix the live Senate feed parser so homepage and API counts match production
