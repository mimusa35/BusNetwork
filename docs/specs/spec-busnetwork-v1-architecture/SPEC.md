---
id: BN-SPEC-001
title: BusNetwork portal — capability contract
version: 1.0
status: final
created: 2026-09-15
updated: 2026-09-16
finalized: 2026-09-16
implements:
  - BN-BRD-001 v1.0
  - BN-PRD-001 v1.0
companions:
  - data-sharing-contract.md
  - v1-boundaries.md
  - ../../planning-artifacts/architecture/architecture-BusNetwork-2026-08-26/ARCHITECTURE-SPINE.md
sources:
  - ../../planning-artifacts/brd/busnetwork-brd-v1/BRD.md
  - ../../planning-artifacts/prd/busnetwork-prd-v1/PRD.md
  - ../../PROJECT-CONTEXT.md
---

> **Canonical contract.** This SPEC and its companions state what engineering builds and QA verifies, in capability form. Business intent is BN-BRD-001; product detail and acceptance criteria are BN-PRD-001. This SPEC cites their IDs and never re-words a requirement. Precedence: BRD › PRD › SPEC › Architecture › UX.


# BusNetwork portal — capability contract

## Why

Operators on TEQ already share trips with partners, but sharing, tracking and settlement live in four separate areas, "active"/"archive" mean different things on different screens, and claims are managed apart from their trips (BRD §2). The portal puts the whole exchange behind six tabs and makes one rule structural: **a trip has exactly one status, and that status alone decides where it is listed** (BR-01). Success is measured by OBJ-1…OBJ-5 (BRD §3; PRD §14 formulas M-1…M-5).

## Capabilities

Each capability lists the BRD requirements it carries and the PRD acceptance criteria that prove it.

- **SC-01 — Portal shell and navigation**
  - **intent:** One navigation bar in fixed order (Dashboard, Request, Active Trips, Closed Trips, All Trips, Invoice List); tabs hidden when the user can't open them; badges for open trips and incoming Pending invoices; deep-linkable routes with URL state.
  - **carries:** BRD §7, BN-LST-06, BN-LST-10, BN-DSH-02, BN-INV-08.
  - **success:** PRD §5; AC-LST-06.1, AC-LST-10.1, AC-DSH-02.1, AC-INV-08.1.

- **SC-02 — Trip lists from one query model**
  - **intent:** Active, Closed and All Trips (and the Invoice List's table behaviour) share one list component and one server-side query model: paging with totals, search on five fields, whole-day date ranges in the user's time zone, company, direction and status filters, stable sort, export.
  - **carries:** BN-LST-01…10, BN-ACT-01…03, BN-ACT-08, BN-CLS-01/02/05/07, BN-ALL-01…03, BN-ALL-05/06, BN-INV-02, BN-INV-10.
  - **success:** AC-LST-*, AC-ACT-01.1…03.1, AC-CLS-01.1/02.1/05.1/07.1, AC-ALL-01.1…03.1, AC-ALL-05.1/06.1, AC-INV-02.1, AC-INV-10.1; NFR-01 load test.

- **SC-03 — Dashboard aggregates**
  - **intent:** Five key figures, upcoming trips, "Needs your action", trip-volume chart and top partners for the user's company and departments, no more than 5 minutes old.
  - **carries:** BN-DSH-01…08.
  - **success:** AC-DSH-*; NFR-01 (< 3 s).

- **SC-04 — Request and share**
  - **intent:** Four-step creation (or prefill from a TEQ trip, or resume a draft) of normal and fixed trips; partner picker restricted to accepted affiliations; per-partner offer price calculated from the agreement, overridable with attribution; additional costs; response deadline; submission creates the trip as Requested with one share request per partner and links back to the TEQ trip.
  - **carries:** BN-REQ-01…10, BR-02, BR-08.
  - **success:** AC-REQ-*.

- **SC-05 — Trip lifecycle and actions**
  - **intent:** A single state machine owns the trip status and each partner's share-request state (PRD §6). Accept / Reject / Edit / Cancel / Comment / Mark complete are offered and enforced from one action matrix; reasons are mandatory for Reject and Cancel; first accept wins atomically; scheduler moves trips to In progress, Completed and Rejected ("Expired"); closed trips are immutable; a post-acceptance price change needs both companies.
  - **carries:** BRD §7, BN-ACT-04…07, BN-ACT-09, BN-DTL-06, BN-CLS-06, BN-ALL-04, BR-01, BR-03, BR-05.
  - **success:** AC-ACT-04.1…07.2, AC-ACT-09.1, AC-DTL-06.1, AC-CLS-06.1, AC-ALL-04.1, AC-BR05.1; 20-way concurrent accept test.

- **SC-06 — Trip detail, comments and history**
  - **intent:** One detail page for every trip tab showing route and map (with the partner's alternative start address), schedule, PAX, vehicle, shifts, pricing, attachments and comment fields — filtered by viewing company; a host↔partner comment thread with per-user read state; a history log of every status change, price change and edit.
  - **carries:** BN-DTL-01…05, BN-CLS-03, BR-04, NFR-04, NFR-05.
  - **success:** AC-DTL-01.1…05.1, AC-CLS-03.1, AC-AUDIT.1.

- **SC-07 — Invoices**
  - **intent:** Partner creates a Draft from a Completed trip (prefilled with offer price, additional costs, VAT from its settings), adds lines, submits; host approves (locks a snapshot) or declines with a reason; a Declined invoice is resubmitted as a new version; Incoming / Outgoing / Archive sub-tabs; PDF in the company's language; filtered totals.
  - **carries:** BN-CLS-04, BN-INV-01…10, BR-06, BR-08.
  - **success:** AC-CLS-04.1, AC-INV-*.

- **SC-08 — Notifications**
  - **intent:** N-01…N-08 (PRD §7.9) delivered in-app and by email, with push and SMS where enabled, in the recipient company's language, with deep links; delivery never blocks or rolls back the triggering action; no duplicates on retry.
  - **carries:** BRD §11, BN-ACT-06/07, BN-DTL-04, BN-INV-06.
  - **success:** AC-NOTIF.1.

- **SC-09 — Access, scope and data sharing**
  - **intent:** TEQ login; role checks on every call; company and department scoping in the query layer; field-level filtering by viewing company per `data-sharing-contract.md`.
  - **carries:** BRD §5, BR-04, BR-09, NFR-03, NFR-05.
  - **success:** AC-ACT-04.1, AC-DTL-01.2, AC-INV-cust, AC-SCOPE.1.

- **SC-10 — Migration, coexistence and consistency**
  - **intent:** Map legacy active/archive trips and claims to the six statuses and four invoice statuses without data loss; keep legacy Sales › Network screens unchanged until replaced; nightly check between each network trip and its TEQ trip that flags, never overwrites.
  - **carries:** BRD §14 assumptions, constraints and risks; Q1.
  - **success:** Trial migration reconciliation signed off by Finance (PRD §15.4); AC for ES-12.

## Constraints

The constraints are the BRD's business rules and non-functional requirements, cited by ID:

- **BR-01 … BR-09** (BRD §10) — enforcement points in PRD §8.
- **NFR-01 … NFR-08** (BRD §12) — test methods in PRD §9.
- **Platform:** runs inside TEQ with the existing login and permission system; must not change current Sales › Network behaviour until the portal replaces it (BRD §14).
- **Canonical values, time and money conventions:** `data-sharing-contract.md` §3–§4.

## Non-goals

Exactly BRD §4 *Out of scope (this release)* — see `v1-boundaries.md` §2 for where each item stays.

## Decisions pending

- **BRD Q1–Q7** (BRD §15) — the PRD's interim behaviour is in PRD §17.1.
- **PRD PQ-01, PQ-02, PQ-04, PQ-10, PQ-15** are blocking for R1 (PRD §17.2).

## Assumptions

- The four BRD §14 assumptions hold: companies have linked Bus Network accounts; agreements are current in BusNetwork Settings; the Bus Network service can filter and count by the six statuses; legacy trips and claims map without data loss.
- The TEQ Platform's stack, service APIs and legacy data model are **not in this workspace**; the Architecture Spine treats them as inherited unknowns (AR-00) rather than inventing them.
