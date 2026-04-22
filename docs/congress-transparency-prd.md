# Product Requirements Document

## Product Name

Working title: Congress Ledger

## Document Version

Version 1.0  
Date: April 22, 2026

## 1. Product Summary

Congress Ledger is a public-facing website that helps Americans understand the people in Congress who directly write, propose, shape, and vote on federal law. The product focuses only on current members of the U.S. House and Senate and presents factual, source-linked information about their terms, votes, missed voting sessions, sponsored bills, and proposed legislation.

The core premise is simple: public attention is often concentrated on the presidency, while Congress, where legislative power actually operates day to day, is under-tracked by ordinary citizens. This product makes congressional activity easier to browse, compare, and understand without partisan framing.

## 2. Problem Statement

Most Americans can name the President, but far fewer can identify their own senators or representative, understand how often they vote, or track the bills they introduce and support. Congressional data exists, but it is fragmented across official government sources, difficult to browse, and often inaccessible to non-expert users.

Current pain points:

- Official data is spread across multiple sites and systems.
- Congressional activity is hard to understand at the member level.
- People struggle to connect national outcomes to legislative behavior.
- Most political coverage emphasizes personalities and elections over governing records.
- Existing civic tools often feel partisan, incomplete, or overly technical.

## 3. Vision

Create the clearest and most trusted public interface for understanding what current members of Congress are actually doing.

## 4. Product Principles

- Factual before interpretive.
- Primary sources over secondary commentary.
- Current members only.
- Bipartisan and non-editorial by design.
- AI is used to explain, summarize, and organize, never to invent facts.
- Every meaningful claim should be traceable to an official source.
- Missing or unavailable data should be labeled honestly.

## 5. Goals

### Primary Goals

- Make it easy for users to find any current House or Senate member.
- Show each member's legislative activity in one place.
- Surface voting participation clearly, including missed roll call votes.
- Organize Congress by state, chamber, and party affiliation.
- Turn raw legislative records into plain-language, nonpartisan explanations.

### Secondary Goals

- Encourage civic awareness beyond presidential politics.
- Help users compare members within a state or party.
- Create a foundation for future analysis, alerts, and public-interest journalism tools.

## 6. Non-Goals

- The product will not score members ideologically in V1.
- The product will not recommend who users should vote for.
- The product will not cover former members in the initial launch.
- The product will not attempt to judge whether a vote or bill is good or bad.
- The product will not rely on AI-generated facts without source validation.

## 7. Target Users

### Primary Audiences

- Civically engaged citizens
- Voters researching their own delegation
- Journalists and researchers
- Students and educators
- Advocacy groups seeking factual legislative records

### User Needs

- "Who represents me right now?"
- "How often does this person actually vote?"
- "What bills have they introduced?"
- "How much time is left in their term?"
- "How does my state's delegation break down by party and chamber?"
- "What did this member do recently?"

## 8. Core User Stories

- As a citizen, I want to browse Congress by state so I can quickly find my delegation.
- As a citizen, I want to see only current members so I am not confused by outdated information.
- As a user, I want to see a member's voting record and missed votes in one place.
- As a user, I want to see which bills a member sponsored and cosponsored.
- As a user, I want a plain-language summary of a bill or vote backed by sources.
- As a user, I want to compare House and Senate members within my state.
- As a user, I want to understand how long someone has been in office and how much time remains in their term.

## 9. Information Architecture

### Primary Navigation

- Home
- Browse by State
- House
- Senate
- Latest Votes
- Bills
- Search

### Core Page Types

#### Home Page

The home page introduces the mission and provides direct entry points into the data. It should mirror the homepage mockup direction: editorial but neutral, clear search, overview metrics, and recent congressional activity.

Key content:

- Mission statement
- Search for member or state
- Current Congress overview
- House and Senate totals
- Recent roll call votes
- Missed vote highlights
- Featured state browser

#### State Page

The state page groups all current members from a given state and breaks them down by chamber and party.

Key content:

- Current senators
- Current representatives
- Party breakdown
- Delegation activity snapshot
- Recent votes involving delegation members
- Sponsored bills by delegation

#### Member Profile Page

This is the centerpiece of the product and should align to the member profile mockup direction.

Key content:

- Name, portrait, chamber, state, district or senate class, party
- Current term start and end
- Time left in term
- Time in office
- Committee assignments
- Recent activity summary
- Sponsored bills
- Cosponsored bills
- Roll call voting history
- Missed votes and participation rate

#### Vote Detail Page

Each official roll call vote gets a detail page.

Key content:

- Vote title and summary
- Chamber, date, congress, session, roll call number
- Result
- Bill or nomination linkage when available
- Member-by-member vote positions
- Source links

#### Bill Detail Page

Each bill page gives context around sponsorship and legislative status.

Key content:

- Bill number and title
- Plain-language summary
- Sponsor
- Cosponsors
- Status and actions
- Related votes
- Source links

## 10. MVP Scope

### Included in MVP

- Current members only
- House and Senate coverage
- Browse by state
- Browse by party
- Member profile pages
- Vote detail pages for official roll call votes
- Sponsored and cosponsored bill lists
- Term countdown and time in office
- Search by member name and state
- AI-generated plain-language summaries with source citation

### Deferred to Later Phases

- Historical member archives
- Public user accounts
- Saved comparisons
- Email alerts
- Shareable report cards
- Advanced analytics and ideological clustering
- Personalized district dashboards

## 11. Functional Requirements

### Member Data

The system must:

- Display only current members of Congress
- Show chamber, party, state, and district or senate class
- Calculate time in office from official term data
- Calculate time left in current term
- Update membership when a seat changes hands

### Voting Data

The system must:

- Ingest official House and Senate roll call votes
- Show each member's recorded vote when available
- Show missed roll call votes as "Not Voting" or equivalent official status
- Distinguish between roll call votes and votes without named individual positions
- Link vote records to the official source

### Bill Data

The system must:

- Ingest sponsored and cosponsored bills for current members
- Display bill metadata and current status
- Link members to bills they introduced or supported
- Show recent legislative actions when available

### Search and Browsing

The system must:

- Support search by member name
- Support browse by state
- Support browse by chamber and party
- Load quickly on desktop and mobile

### AI Layer

The system must:

- Generate plain-language summaries only after source data is ingested
- Cite the underlying official source on every AI-assisted summary
- Avoid evaluative or partisan wording
- Fail safely when the source data is incomplete

## 12. Data Sources

Primary sources should be official whenever possible.

Planned official inputs:

- Congress.gov API for members, bills, sponsorships, and legislative metadata
- House Clerk official roll call vote data
- Senate official roll call vote data
- Official House member directory
- Official Senate member directory

Important data rule:

Not every congressional vote includes named individual voting records. The product must clearly indicate when no individual member-level vote record exists because the vote was not a roll call vote.

## 13. Recommended Technical Approach

### Stack

- Frontend: Next.js
- Backend: Next.js server routes or separate API service
- Database: PostgreSQL
- Hosting: Vercel or equivalent
- Scheduled ingestion: cron jobs or queue-based workers
- Search: PostgreSQL full-text search for MVP, dedicated search later if needed

### Data Architecture

Suggested core tables:

- members
- member_terms
- committees
- member_committees
- bills
- bill_sponsorships
- votes
- vote_positions
- sessions
- source_import_runs

### Data Pipeline

1. Pull current member roster from official sources
2. Normalize member identities across sources
3. Pull votes, bill sponsorships, and legislative metadata
4. Store raw source references and normalized records
5. Generate AI summaries from stored source-backed data
6. Revalidate pages and caches

## 14. UX Requirements

### Tone

- Serious
- Trustworthy
- Public-service oriented
- Neutral and factual

### Visual Direction

The mockups imply a product that should feel more like an editorial civic intelligence platform than a campaign site or flashy news app.

Design requirements:

- Balanced use of red and blue accents without partisan emphasis
- Clear tables and structured cards
- Excellent mobile responsiveness
- Search-first navigation
- Strong hierarchy for stats, votes, and bills
- Accessible typography and contrast

### Mobile Experience

The mobile state-browsing concept should be part of the MVP design system.

Mobile must support:

- State browsing
- Delegation summary
- Member cards
- Recent votes
- Quick access to House and Senate filters

## 15. Trust, Safety, and Neutrality

- All summaries must be attributable to source data.
- Political persuasion language is prohibited.
- Opinions should never be presented as facts.
- Missing or delayed data should be labeled clearly.
- The product should show methodology and source disclosures publicly.
- Every AI-generated output should be clearly labeled as AI-assisted.

## 16. Success Metrics

### Product Metrics

- Successful searches for member pages
- State page engagement
- Member profile visit depth
- Return visitor rate
- Time spent on vote and bill detail pages

### Quality Metrics

- Percentage of member records with complete current-term data
- Percentage of vote records linked to official sources
- AI summary error rate
- Data freshness lag

### Trust Metrics

- User feedback on clarity and neutrality
- Low rate of reported factual corrections
- Source click-through rate

## 17. Launch Plan

### Phase 1: Prototype

- Finalize data model
- Build homepage, state page, and member profile prototype
- Ingest a limited slice of current member and recent vote data
- Validate IA with mockup-driven design

### Phase 2: MVP Build

- Complete current member ingestion
- Add votes, bills, and sponsorship data
- Build search and state browsing
- Add AI-assisted summaries with citations
- Launch internal beta

### Phase 3: Public Launch

- Improve performance and monitoring
- Add methodology and transparency pages
- Launch to the public
- Begin iterative improvement from real usage data

## 18. Risks and Mitigations

### Risk: Data inconsistency across sources

Mitigation:

- Preserve raw source identifiers
- Build reconciliation rules
- Display source-attribution on records

### Risk: AI summaries drift from source facts

Mitigation:

- Summarize only from stored source excerpts and normalized data
- Require citations
- Add review and QA workflows

### Risk: Users perceive bias

Mitigation:

- Use neutral language patterns
- Avoid ideological scoring in MVP
- Publish clear methodology and data source rules

### Risk: Freshness gaps when Congress changes rapidly

Mitigation:

- Run scheduled updates
- Surface last updated timestamps
- Build admin monitoring for failed imports

## 19. Open Questions

- Should committee data be in MVP or phase 2?
- Should cosponsored bills be fully indexed at launch or limited to recent activity?
- Should the homepage emphasize discovery by state or direct member search first?
- Do we want district-level entry points in MVP for House users?
- Should there be a methodology page at launch or before beta?

## 20. Immediate Next Steps

1. Approve product name and positioning
2. Finalize MVP feature list
3. Design wireframes based on the three mockup directions
4. Create the database schema
5. Build source-ingestion proof of concept
6. Develop homepage, state page, and member profile in parallel
7. Add source-linked AI summary workflow

## 21. Positioning Statement

Presidents dominate headlines. Congress makes the law. Congress Ledger helps the public track the people actually voting, sponsoring bills, and shaping federal policy.
