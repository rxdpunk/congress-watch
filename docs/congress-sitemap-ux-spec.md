# Congress Ledger Sitemap and UX Specification

## Document Purpose

This document translates the PRD into a page structure and screen-by-screen UX spec for MVP. It is intended to guide product design, frontend implementation, content strategy, and early usability review.

## Product UX Goal

Help users answer three questions quickly:

- Who represents me right now?
- What has this member actually done?
- How has this person voted and how often do they participate?

The experience should feel editorial, trustworthy, and civic-minded without resembling campaign media or partisan news.

## Primary Navigation

Top-level navigation for MVP:

- Home
- Browse by State
- House
- Senate
- Latest Votes
- Bills
- Search

Global utilities:

- Search input
- Methodology
- Data Sources
- About

## URL Sitemap

### Core Routes

- `/`
- `/states`
- `/states/[stateSlug]`
- `/house`
- `/senate`
- `/members/[memberSlug]`
- `/votes`
- `/votes/[chamber]/[congress]/[session]/[rollCallNumber]`
- `/bills`
- `/bills/[congress]/[billType]/[billNumber]`
- `/search`
- `/methodology`
- `/data-sources`
- `/about`

### Optional Near-Term Routes

- `/party/[partySlug]`
- `/topics/[topicSlug]`
- `/compare/[memberA]/[memberB]`

These can remain out of MVP if speed to launch matters.

## Global UX Rules

- Always show that the site covers current members only.
- Always show last updated timestamps for time-sensitive data.
- Always label AI-generated summaries as AI-assisted.
- Always provide a source section with official links.
- Never imply a member-level vote exists when the underlying vote was not a named roll call.
- Keep red and blue accents balanced and subdued.
- Prioritize readability over dashboard density.

## Shared Layout System

### Header

Persistent elements:

- Wordmark
- Main nav
- Search field
- Current Congress indicator

Desktop behavior:

- Search visible in header
- Sticky on scroll after hero sections collapse

Mobile behavior:

- Compact header
- Search opens in modal or full-width drawer
- Main nav collapses to menu

### Footer

Footer links:

- Methodology
- Data Sources
- About
- Accessibility
- Contact
- Last data refresh timestamp

## Page Specifications

## 1. Home Page

### Route

- `/`

### Primary User Goal

Understand the value of the site and jump quickly into member discovery.

### Key Message

Congress deserves the same scrutiny as the presidency.

### Content Blocks

#### Hero Section

Content:

- Mission statement
- Search bar for member or state
- CTA buttons for `Browse by State` and `See Latest Votes`
- Current Congress badge

Behavior:

- Search should autocomplete both members and states
- If user enters a state, route to the matching state page
- If user enters a member, route directly to profile

#### Congress Overview Strip

Content:

- Total current senators
- Total current representatives
- Total current members
- Recent roll call vote count
- Aggregate missed vote metric

Purpose:

- Provide fast orientation without becoming a stats wall

#### Browse by State Module

Content:

- Searchable state list or visual state picker
- Highlight a few example states

Behavior:

- Hover on desktop shows delegation count
- Tap on mobile opens state page directly

#### Recent Votes Module

Content:

- Latest House votes
- Latest Senate votes
- Vote result
- Date
- Link to detail page

Behavior:

- Allow chamber filter
- Show concise descriptive titles

#### Accountability Snapshot Module

Content:

- Members with recent missed votes
- Recently introduced bills
- Recently active members

Important note:

- This module must remain factual and descriptive, not accusatory

### Primary CTAs

- Browse by State
- Search Members
- View Latest Votes

### Empty and Error States

- If latest vote feed fails, show fallback message and retain browse/search actions
- If some metrics are delayed, show `Data refresh in progress`

## 2. State Directory Page

### Route

- `/states`

### Primary User Goal

Find a state quickly and enter a delegation view.

### Content Blocks

- Search by state name or abbreviation
- Alphabetical state grid
- Optional U.S. map entry point
- Current delegation count per state

### Interaction Notes

- Search should support `CA`, `California`, and common user patterns
- Mobile should favor list browsing over a dense map

## 3. State Detail Page

### Route

- `/states/[stateSlug]`

### Primary User Goal

See the full current congressional delegation for a state and understand activity at a glance.

### Content Blocks

#### State Header

- State name
- Delegation summary
- Party breakdown
- Number of senators and representatives

#### Delegation Cards

Cards for all current members from the state.

Card fields:

- Name
- Chamber
- District or senate class
- Party
- Term end
- Participation snapshot

Behavior:

- Sort by chamber first
- Allow filter by party
- Allow sort by name, seniority, missed votes

#### Delegation Activity Module

- Recent votes involving delegation members
- Recently sponsored bills
- Aggregate participation stats

#### State Comparison Strip

- House vs Senate composition
- Delegation tenure overview

### UX Considerations

- Users often arrive here trying to find “my representatives,” so delegation cards must stay simple and scannable
- The state page should not overload with charts before showing the people

## 4. House Directory Page

### Route

- `/house`

### Primary User Goal

Browse all current House members.

### Content Blocks

- Search
- Filters for state and party
- Sort by name, seniority, term end, missed votes
- Paginated or virtualized member grid

### Card Design

Each card should show:

- Name
- State and district
- Party
- Time in office
- Current term end

## 5. Senate Directory Page

### Route

- `/senate`

### Primary User Goal

Browse all current senators.

### Content Blocks

- Search
- Filters for state and party
- Sort by name, class, seniority, term end, missed votes
- Member grid

### Card Design

Each card should show:

- Name
- State
- Party
- Senate class
- Time in office
- Current term end

## 6. Member Profile Page

### Route

- `/members/[memberSlug]`

### Primary User Goal

Understand one current member’s role, tenure, participation, and legislative record quickly.

### Page Priority

This is the most important page in the product.

### Content Blocks

#### Identity Header

- Portrait
- Full name
- Chamber
- State
- District or senate class
- Party
- Current office start date

Secondary actions:

- Copy link
- Open official website
- View state delegation

#### Service and Term Module

- Current term start
- Current term end
- Time left in term
- Time in office
- Service timeline

Behavior:

- Time-left visualization should be clear but restrained
- Use a progress bar or radial element only if it does not dominate the page

#### AI-Assisted Summary Module

- Plain-language overview of recent activity
- Explicit AI-assisted label
- Source links below summary

Rules:

- Summary must be descriptive only
- No ideological labels or persuasive framing

#### Voting Record Module

- Participation rate
- Total recorded votes in range
- Missed vote count
- Recent roll call table

Table columns:

- Date
- Vote title
- Bill or nomination link
- Member position
- Result

Filters:

- Chamber-specific vote type not needed here because member is chamber-bound
- Date range
- Position type

#### Sponsored Bills Module

- Recent sponsored bills
- Status
- Latest action

#### Cosponsored Bills Module

- Recent cosponsored bills
- Status
- Latest action

#### Committee Assignments Module

- Committee name
- Role if available

#### Sources and Methodology Module

- Official source links
- Last refreshed timestamp
- Notes for unavailable data

### Sticky Navigation

Recommended section anchors:

- Overview
- Votes
- Bills
- Committees
- Sources

### Empty and Error States

- If no current committee data exists, say `No current committee assignments available`
- If a vote source is incomplete, say `Official source does not provide individual vote detail for this item`

## 7. Votes Index Page

### Route

- `/votes`

### Primary User Goal

Browse recent official roll call votes across both chambers.

### Content Blocks

- Chamber filter
- Congress/session filter
- Date range filter
- Vote list table

### Table Columns

- Date
- Chamber
- Roll call number
- Title
- Result
- Linked bill or nomination

### Sorting

- Default sort by most recent

## 8. Vote Detail Page

### Route

- `/votes/[chamber]/[congress]/[session]/[rollCallNumber]`

### Primary User Goal

Understand what the vote was and how each member voted.

### Content Blocks

#### Vote Header

- Vote title
- Chamber
- Congress and session
- Roll call number
- Date
- Result

#### Plain-Language Vote Summary

- AI-assisted summary of what the vote concerned
- Source attribution

#### Vote Breakdown

- Yea
- Nay
- Present
- Not voting

#### Member Vote Table

Columns:

- Member
- State
- Party
- Position

Behavior:

- Search within vote table
- Filter by position

#### Related Context

- Linked bill or nomination
- Related vote pages

#### Source Panel

- Official roll call link
- Any linked Congress.gov item

### UX Rule

- If a vote has no member-level positions because it was not a roll call, do not create this page in MVP

## 9. Bills Index Page

### Route

- `/bills`

### Primary User Goal

Browse current-congress bills with focus on sponsor relationships.

### Content Blocks

- Search by bill number or title
- Filter by chamber of origin
- Filter by sponsor party
- Sort by latest action

### Table Columns

- Bill
- Title
- Sponsor
- Latest action
- Status

## 10. Bill Detail Page

### Route

- `/bills/[congress]/[billType]/[billNumber]`

### Primary User Goal

Understand what a bill is, who introduced it, where it stands, and which current members are attached to it.

### Content Blocks

#### Bill Header

- Bill number
- Official title
- Congress
- Origin chamber
- Status

#### Plain-Language Summary

- AI-assisted descriptive summary
- Source links

#### Sponsor and Cosponsor Module

- Primary sponsor
- Cosponsor count
- Linked member cards

#### Legislative Progress Module

- Key actions timeline

#### Related Votes Module

- Associated roll call votes when available

## 11. Search Results Page

### Route

- `/search`

### Primary User Goal

Resolve ambiguous user intent quickly.

### Search Types

- Members
- States
- Bills
- Votes

### UX Rules

- Members and states should rank highest for common natural-language searches
- Typo tolerance is important
- Highlight matched fields

## 12. Methodology Page

### Route

- `/methodology`

### Purpose

Build trust through transparent explanations of how data is collected, updated, and summarized.

### Required Sections

- What data sources are used
- What “current members only” means
- How votes are counted
- How missed votes are labeled
- How AI summaries are generated
- What limitations users should understand

## 13. Data Sources Page

### Route

- `/data-sources`

### Purpose

Provide a direct reference page for official sources.

### Required Sections

- Congress.gov
- House Clerk
- Senate official roll call system
- Official House member directory
- Official Senate member directory

## 14. About Page

### Route

- `/about`

### Purpose

Explain the civic mission and why Congress is the focus.

### Content

- Mission
- Product principles
- Neutrality stance
- Contact

## Search and Discovery UX

### Search Behavior

The search bar should support:

- Full names
- Last names
- State names
- State abbreviations
- Bill numbers such as `H.R. 1234`
- Vote identifiers such as `House Roll Call 52`

### Autocomplete Result Grouping

- Members
- States
- Bills
- Votes

### Query Routing

- Exact state match routes to state page
- Exact member match routes to member page
- Mixed or ambiguous queries route to `/search`

## Filters and Sorting Standards

### Common Filters

- State
- Party
- Chamber
- Date range
- Status

### Common Sort Orders

- Most recent
- Alphabetical
- Seniority
- Term ending soonest
- Most missed votes

## Responsive Design Requirements

### Desktop

- Editorial homepage layout
- Dense but readable tables
- Sticky side anchors on long profiles

### Tablet

- Two-column layouts collapse gracefully
- Tables horizontally scroll only when necessary

### Mobile

- Cards prioritized over wide tables
- Filters in bottom sheet or drawer
- Search persistently accessible
- Key metrics shown before long lists

## Accessibility Requirements

- WCAG-conscious contrast and typography
- Keyboard-accessible filters and search
- Semantic tables for legislative data
- Clear labels for charts and progress visuals
- No color-only distinctions for vote outcomes or party

## Content Tone Guidelines

- Use plain English
- Prefer descriptive verbs over loaded political language
- Never use celebratory or condemnatory framing
- Avoid “wins,” “fails,” “attacks,” or “betrays” language in product copy

## MVP Design System Recommendations

- One primary layout shell
- Reusable data cards
- Reusable table component
- Reusable source panel
- Reusable AI-summary block with label and citation pattern
- Reusable filter bar for list pages

## Recommended Build Order

1. Global layout, header, footer, search shell
2. Home page
3. State directory and state detail pages
4. Member profile page
5. Votes index and vote detail pages
6. Bills index and bill detail pages
7. Methodology and data-sources pages
