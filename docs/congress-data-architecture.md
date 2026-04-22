# Congress Ledger Data Schema and Ingestion Architecture

## Document Purpose

This document defines the MVP data model, ingestion design, reconciliation rules, and freshness strategy for Congress Ledger. It is optimized for an official-source-first product that covers current members only.

## Architecture Principles

- Store primary-source identifiers whenever possible.
- Separate raw ingest data from normalized application data.
- Make current-member logic explicit rather than inferred ad hoc.
- Preserve provenance for every important record.
- Treat AI summaries as derived content, never source truth.

## High-Level System Design

### Main Layers

1. Source ingestion layer
2. Raw source storage layer
3. Normalization and reconciliation layer
4. Application database layer
5. Derived summary generation layer
6. Cache and page revalidation layer

### Source Systems

- Congress.gov API
- House Clerk official roll call vote sources
- Senate official roll call vote sources
- Official House member directory
- Official Senate member directory

## Recommended Database

- PostgreSQL for MVP

Why:

- Strong relational modeling
- Good support for search, JSON fields, and indexing
- Straightforward fit for source provenance and many-to-many joins

## Core Entity Model

### Main Entities

- congresses
- sessions
- chambers
- states
- parties
- members
- member_terms
- committees
- member_committees
- bills
- bill_titles
- bill_actions
- bill_sponsorships
- votes
- vote_positions
- source_documents
- import_runs
- ai_summaries

## Relational Schema

### 1. congresses

Represents a numbered Congress.

Suggested fields:

- `id` UUID PK
- `congress_number` integer unique not null
- `start_date` date not null
- `end_date` date not null
- `is_current` boolean not null default false
- `created_at` timestamptz
- `updated_at` timestamptz

### 2. sessions

Represents congressional sessions within a Congress.

Suggested fields:

- `id` UUID PK
- `congress_id` UUID FK -> congresses.id
- `session_number` integer not null
- `start_date` date
- `end_date` date
- `label` text
- `created_at` timestamptz
- `updated_at` timestamptz

Unique constraint:

- `(congress_id, session_number)`

### 3. chambers

Reference table.

Suggested fields:

- `code` text PK
- `name` text unique not null

Seed values:

- `house`
- `senate`

### 4. states

Reference table for U.S. states and territories included in scope.

Suggested fields:

- `code` text PK
- `name` text unique not null
- `slug` text unique not null

### 5. parties

Reference table.

Suggested fields:

- `code` text PK
- `name` text unique not null
- `display_order` integer

### 6. members

Canonical person record for a current or potentially current member identity.

Suggested fields:

- `id` UUID PK
- `bioguide_id` text unique
- `congress_gov_member_id` text unique
- `first_name` text
- `middle_name` text
- `last_name` text not null
- `suffix` text
- `full_name` text not null
- `slug` text unique not null
- `date_of_birth` date
- `gender` text
- `official_website_url` text
- `photo_url` text
- `is_current_member` boolean not null default false
- `created_at` timestamptz
- `updated_at` timestamptz

Notes:

- `is_current_member` should be driven by active term logic, not hand-edited.
- Keep member identity separate from a given term or seat assignment.

### 7. member_terms

Represents a member’s service term in a given chamber and seat context.

Suggested fields:

- `id` UUID PK
- `member_id` UUID FK -> members.id
- `chamber_code` text FK -> chambers.code
- `congress_id` UUID FK -> congresses.id
- `state_code` text FK -> states.code
- `district` integer nullable
- `senate_class` integer nullable
- `party_code` text FK -> parties.code
- `term_start_date` date not null
- `term_end_date` date not null
- `sworn_in_date` date
- `service_start_date` date
- `service_end_date` date
- `is_active` boolean not null default true
- `seat_label` text
- `source_document_id` UUID FK -> source_documents.id
- `created_at` timestamptz
- `updated_at` timestamptz

Important rules:

- House rows require `district`.
- Senate rows require `senate_class`.
- Only one active current term per chamber-seat combination should exist at a time.

Suggested unique indexes:

- `(member_id, chamber_code, term_start_date)`
- partial unique index on active seat tuple where appropriate

### 8. committees

Suggested fields:

- `id` UUID PK
- `external_id` text unique
- `name` text not null
- `chamber_code` text FK -> chambers.code
- `committee_type` text
- `parent_committee_id` UUID FK -> committees.id nullable
- `is_current` boolean default true
- `created_at` timestamptz
- `updated_at` timestamptz

### 9. member_committees

Many-to-many relation between members and committees.

Suggested fields:

- `id` UUID PK
- `member_term_id` UUID FK -> member_terms.id
- `committee_id` UUID FK -> committees.id
- `role` text
- `start_date` date
- `end_date` date
- `is_current` boolean not null default true
- `source_document_id` UUID FK -> source_documents.id

Unique constraint:

- `(member_term_id, committee_id, role, start_date)`

### 10. bills

Canonical bill record.

Suggested fields:

- `id` UUID PK
- `congress_id` UUID FK -> congresses.id
- `bill_type` text not null
- `bill_number` integer not null
- `origin_chamber_code` text FK -> chambers.code
- `official_title` text
- `short_title` text
- `policy_area` text
- `introduced_date` date
- `latest_action_text` text
- `latest_action_date` date
- `status_code` text
- `status_label` text
- `congress_gov_url` text
- `source_document_id` UUID FK -> source_documents.id
- `created_at` timestamptz
- `updated_at` timestamptz

Unique constraint:

- `(congress_id, bill_type, bill_number)`

### 11. bill_titles

Optional table if multiple title variants matter.

Suggested fields:

- `id` UUID PK
- `bill_id` UUID FK -> bills.id
- `title_type` text
- `title_text` text not null
- `as_of_date` date

### 12. bill_actions

Stores timeline actions on a bill.

Suggested fields:

- `id` UUID PK
- `bill_id` UUID FK -> bills.id
- `action_date` date not null
- `action_text` text not null
- `action_type` text
- `source_document_id` UUID FK -> source_documents.id
- `sequence_number` integer

Index:

- `(bill_id, action_date desc)`

### 13. bill_sponsorships

Captures sponsor and cosponsor relationships.

Suggested fields:

- `id` UUID PK
- `bill_id` UUID FK -> bills.id
- `member_id` UUID FK -> members.id
- `sponsorship_type` text not null
- `sponsorship_date` date
- `withdrawn_date` date nullable
- `is_primary` boolean not null default false
- `source_document_id` UUID FK -> source_documents.id

Allowed values:

- `sponsor`
- `cosponsor`

Unique constraint:

- `(bill_id, member_id, sponsorship_type)`

### 14. votes

Canonical roll call vote record.

Suggested fields:

- `id` UUID PK
- `chamber_code` text FK -> chambers.code
- `congress_id` UUID FK -> congresses.id
- `session_id` UUID FK -> sessions.id nullable
- `roll_call_number` integer not null
- `vote_date` date not null
- `vote_time` timestamptz nullable
- `title` text not null
- `question` text
- `result_text` text
- `result_status` text
- `vote_type` text
- `requires_roll_call_positions` boolean not null default true
- `related_bill_id` UUID FK -> bills.id nullable
- `related_nomination_text` text nullable
- `official_source_url` text not null
- `source_document_id` UUID FK -> source_documents.id
- `created_at` timestamptz
- `updated_at` timestamptz

Unique constraint:

- `(chamber_code, congress_id, session_id, roll_call_number)`

Notes:

- MVP should only expose named roll call votes.
- Keep `requires_roll_call_positions` to handle future non-roll-call metadata without inventing missing records.

### 15. vote_positions

Member-level recorded position for a vote.

Suggested fields:

- `id` UUID PK
- `vote_id` UUID FK -> votes.id
- `member_id` UUID FK -> members.id
- `member_term_id` UUID FK -> member_terms.id nullable
- `position_code` text not null
- `position_label` text not null
- `party_code_at_vote` text FK -> parties.code nullable
- `state_code_at_vote` text FK -> states.code nullable
- `district_at_vote` integer nullable
- `source_document_id` UUID FK -> source_documents.id
- `created_at` timestamptz
- `updated_at` timestamptz

Common values:

- `yea`
- `nay`
- `present`
- `not_voting`

Unique constraint:

- `(vote_id, member_id)`

### 16. source_documents

Tracks provenance for imported records.

Suggested fields:

- `id` UUID PK
- `source_system` text not null
- `source_type` text not null
- `external_id` text nullable
- `url` text not null
- `retrieved_at` timestamptz not null
- `checksum` text nullable
- `raw_payload_json` jsonb nullable
- `created_at` timestamptz

Purpose:

- Give every important record a trail back to the source object or page

### 17. import_runs

Tracks scheduled or manual imports.

Suggested fields:

- `id` UUID PK
- `pipeline_name` text not null
- `started_at` timestamptz not null
- `completed_at` timestamptz nullable
- `status` text not null
- `records_seen` integer default 0
- `records_inserted` integer default 0
- `records_updated` integer default 0
- `records_failed` integer default 0
- `error_summary` text nullable
- `metadata_json` jsonb nullable

### 18. ai_summaries

Derived summaries attached to product entities.

Suggested fields:

- `id` UUID PK
- `entity_type` text not null
- `entity_id` UUID not null
- `summary_type` text not null
- `summary_text` text not null
- `model_name` text not null
- `prompt_version` text not null
- `source_snapshot_json` jsonb not null
- `generated_at` timestamptz not null
- `is_current` boolean not null default true
- `quality_status` text not null default 'generated'

Recommended entity types:

- `member`
- `bill`
- `vote`

## Recommended Derived Views

### current_member_profiles

A database view or materialized view to simplify frontend reads.

Includes:

- active term
- current chamber
- state
- district or senate class
- party
- service length
- term end

### member_vote_stats

Precomputed aggregates for:

- total recorded votes
- total yea
- total nay
- total present
- total not voting
- participation percentage

### state_delegation_stats

Precomputed aggregates for:

- total members in state
- chamber split
- party split
- average participation metrics

## Identity and Reconciliation Rules

### Canonical Member Identity

Use `bioguide_id` as the primary durable cross-source identity when available.

Fallback matching fields:

- full name
- chamber
- state
- district or senate class
- official site URL

### Seat Identity

Represent seats as:

- House: `state_code + district + chamber`
- Senate: `state_code + senate_class + chamber`

### Reconciliation Priorities

1. Match by stable official external identifier
2. Match by known seat and active term dates
3. Match by normalized name only if the seat context agrees

## Ingestion Pipelines

## Pipeline 1: Current Member Roster Sync

### Purpose

Keep the current House and Senate roster accurate.

### Sources

- Official House directory
- Official Senate directory
- Congress.gov members data

### Frequency

- Daily
- Manual run on major seat changes

### Steps

1. Fetch current House member list
2. Fetch current Senate member list
3. Fetch Congress.gov member metadata
4. Normalize names, state, chamber, district, party, official URLs
5. Upsert canonical `members`
6. Upsert active `member_terms`
7. Mark previously active terms inactive when no longer current
8. Recompute `is_current_member`

## Pipeline 2: Bills Sync

### Purpose

Import current-congress bills tied to current members.

### Scope for MVP

- Bills sponsored by current members
- Bills cosponsored by current members
- Bill metadata
- Latest actions

### Frequency

- Every 6 hours

### Steps

1. Fetch bill lists from Congress.gov
2. Filter to current Congress
3. Upsert `bills`
4. Upsert `bill_actions`
5. Upsert `bill_sponsorships`
6. Queue summary regeneration for changed bills

## Pipeline 3: House Votes Sync

### Purpose

Import official House roll call vote data.

### Frequency

- Hourly during active legislative days
- Daily backfill pass

### Steps

1. Discover newly published House roll call votes
2. Parse vote metadata
3. Upsert `votes`
4. Parse member-level positions
5. Upsert `vote_positions`
6. Recompute aggregates for affected members and states
7. Queue AI vote summaries

## Pipeline 4: Senate Votes Sync

### Purpose

Import official Senate roll call vote data.

### Frequency

- Hourly during active legislative days
- Daily backfill pass

### Steps

1. Discover newly published Senate roll call votes
2. Parse vote metadata
3. Upsert `votes`
4. Parse member-level positions
5. Upsert `vote_positions`
6. Recompute aggregates for affected members and states
7. Queue AI vote summaries

## Pipeline 5: Committee Sync

### Purpose

Import committee assignments if included in MVP or early phase 2.

### Frequency

- Daily or on source refresh

## Pipeline 6: AI Summary Generation

### Purpose

Generate descriptive summaries from already-ingested source-backed data.

### Trigger Rules

- New or materially changed member activity
- New or materially changed bill
- New vote imported

### Input Rules

Use only:

- normalized database fields
- source-backed excerpts
- explicit source metadata

Do not use:

- open-ended web browsing
- unsourced political claims
- inferred ideology labels

### Output Rules

Every summary must:

- be labeled AI-assisted
- include source references
- avoid evaluative language
- store prompt and source snapshot for auditability

## Freshness Strategy

### Recommended Refresh Cadence

- Member roster: daily
- Votes: hourly during session activity
- Bills: every 6 hours
- Committees: daily
- Derived aggregates: after each dependent import
- AI summaries: async job queue after ingest completion

### Frontend Freshness Signals

Every major page should surface:

- `Last updated`
- `Source updated at` where useful

## Error Handling and Reliability

### Principles

- Do not delete data on transient source failures
- Mark stale data instead of hiding the page
- Log import errors with enough detail for replay

### Failure Modes

#### Source unavailable

Behavior:

- Keep prior data
- Flag import run as failed
- Surface stale timestamp if threshold exceeded

#### Partial parse failure

Behavior:

- Keep successfully parsed records
- Record exact failed source object
- Retry idempotently

#### Identity conflict

Behavior:

- Quarantine ambiguous record
- Do not overwrite canonical member without deterministic match

## Idempotency Rules

- All imports should upsert by stable external key
- Re-running the same source file should not duplicate records
- Source payload checksum may be used to skip unchanged documents

## Search Considerations

### MVP Search Fields

- `members.full_name`
- `members.last_name`
- `states.name`
- `states.code`
- `bills.official_title`
- `bills.bill_number`
- `votes.title`

### Indexing Recommendations

- trigram or full-text index on member names
- composite index for bill lookup by congress, type, number
- date and chamber index for vote browsing

## Suggested Key Indexes

### Members

- unique index on `bioguide_id`
- unique index on `slug`
- index on `last_name`
- GIN or trigram index on `full_name`

### Member Terms

- index on `member_id`
- index on `state_code`
- index on `party_code`
- partial index on `is_active = true`

### Bills

- unique index on `(congress_id, bill_type, bill_number)`
- index on `latest_action_date desc`

### Bill Sponsorships

- index on `member_id`
- index on `bill_id`

### Votes

- unique index on chamber/session/roll-call tuple
- index on `vote_date desc`
- index on `related_bill_id`

### Vote Positions

- unique index on `(vote_id, member_id)`
- index on `member_id`
- index on `position_code`

## API and Read Model Suggestions

### Example Read Endpoints

- `GET /api/home`
- `GET /api/states`
- `GET /api/states/:slug`
- `GET /api/members/:slug`
- `GET /api/votes`
- `GET /api/votes/:id`
- `GET /api/bills`
- `GET /api/bills/:id`
- `GET /api/search?q=`

### Read Model Pattern

Use read-optimized queries or views for:

- homepage metrics
- state delegation pages
- member profile pages

This avoids excessive joins in the UI layer.

## AI Summary Auditability

For every stored summary, keep:

- model name
- prompt version
- generation timestamp
- source snapshot
- quality status

This makes summaries reviewable and regenerable if prompts change.

## Security and Integrity Notes

- Run source ingestion server-side only
- Keep API keys off the client
- Treat source records as untrusted input and validate parsers
- Escape or sanitize imported text displayed in UI

## MVP Delivery Recommendation

### Phase A

- Build schema
- Seed reference tables
- Implement roster sync

### Phase B

- Implement bill sync
- Implement House and Senate vote sync
- Build aggregate views

### Phase C

- Add AI summary generation
- Add freshness metadata
- Add operational dashboards for import health

## Open Technical Decisions

- Whether to store raw source payloads in Postgres or object storage
- Whether committee data belongs in MVP
- Whether search stays in Postgres or moves to a dedicated search engine later
- Whether AI summary generation runs inline after import or through a queue worker
