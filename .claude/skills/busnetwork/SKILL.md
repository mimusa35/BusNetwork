---
name: busnetwork
description: BusNetwork (TEQ Platform) domain, architecture and change-safety guide. Use when developing, debugging, reviewing or testing anything BusNetwork — trip sharing with partner companies, share requests and accept/reject, the six trip statuses and tab placement, scheduler transitions, the TEQ-trip link and nightly consistency check, invoices/settlement, cross-company visibility, department scope — or when citing BN-*/BR-*/NFR-*/AR-*/PQ-* IDs.
---

# BusNetwork

BusNetwork is a portal inside TEQ Platform where a **host** bus company shares trips with **partner** companies, follows each trip until it finishes, and settles it by invoice. This skill tells you where the truth lives, which rules are load-bearing, what is actually built, and how to change things without breaking cross-company integrity.

Every project claim here cites a document or file. When this skill and a cited document disagree, the document wins; fix this skill.

## 1. Sources of truth and precedence

**BRD › PRD › SPEC › Architecture › UX › POC.** A lower document that contradicts a higher one is a defect in the lower one.

| Document | Path | Use it for |
|---|---|---|
| BRD `BN-BRD-001` v1.0 final | `docs/planning-artifacts/brd/busnetwork-brd-v1/BRD.md` | Business requirements `BN-*`, rules `BR-01..09`, `NFR-01..08`, `OBJ-1..5`, open questions `Q1..Q7` |
| PRD `BN-PRD-001` v2.0 final | `docs/planning-artifacts/prd/busnetwork-prd-v1/PRD.md` (5 100 lines; grep by ID) | `FR-001..110`, acceptance criteria `AC-*`, edge cases `ES-01..32` (§12), transitions `T1..T7`/`I1..I6` (App. B), data entities `DE-*` (App. C), integrations (App. D), notifications `N-01..08` (App. E), `DR-*` (App. I), `WA-*`/`PQ-*` (App. J) |
| SPEC `BN-SPEC-001` | `docs/specs/spec-busnetwork-v1-architecture/SPEC.md` | Capabilities `SC-01..10` |
| Data-sharing contract | `docs/specs/spec-busnetwork-v1-architecture/data-sharing-contract.md` | Field visibility per company, canonical enum codes, time/money conventions, audit entry shape |
| Release boundaries | `docs/specs/spec-busnetwork-v1-architecture/v1-boundaries.md` | R1 / R1.1 / Later slices; what each open question would move |
| Architecture Spine `BN-ARCH-001` | `docs/planning-artifacts/architecture/architecture-BusNetwork-2026-08-26/ARCHITECTURE-SPINE.md` | Invariants `AR-00..12`, components `C-01..16`, entity sketch, error codes |
| UX package + prototype | `docs/planning-artifacts/ux-designs/ux-busnetwork-2026-08-26/` | Screens `S-*`, journeys `UJ-*`; clickable JS prototype in `prototype/` |
| Validation report | `docs/planning-artifacts/prd/busnetwork-prd-v1/VALIDATION-REPORT.md` | Known tensions in the BRD (F-1) and blocking decisions (F-3) |
| Orientation | `docs/PROJECT-CONTEXT.md` | One-page summary; never adds to the BRD |
| Architecture overview | `docs/ARCHITECTURE.md` | Repo map, target architecture and POC-to-component mapping in one page; never adds to the Spine |
| Decision logs | `.memlog.md` beside each document under `docs/planning-artifacts/` and `docs/specs/` | Why each planning document says what it says (BMAD format) |

**Citing.** Cite IDs, never wording. IDs are never reused; a removed item is marked withdrawn.

**Stale section numbers.** SPEC and Architecture cite PRD **v1.0 section numbers** (e.g. "PRD §6.3", "§7.4", "§17.2"). The PRD is now v2.0; translate with PRD Appendix K. Common ones: v1 §6.1–6.4 → App. B (+FR-079); v1 §7.4 action matrix → FR-069; v1 §7.10 → FR-100..104; v1 §12 → §12; v1 §17.1/17.2 → App. J.1/J.2.

**Withdrawn design — do not reintroduce.** An earlier event-sourced design ("Trip Commitment", "Synchronization Contract", CAP-1..6, AD-0..12, derived status, disputes-as-events, no-price-override) was deleted at finalization (VALIDATION-REPORT Check 5). If a request uses that vocabulary, map it to the current model (§4 below) and say you did.

## 2. What exists in code today

**No production code and no TEQ Platform source are in this workspace** (Architecture AR-00; Spine "Stack: UNKNOWN — inherit from TEQ Platform"). The Bus Network service API, its data model, legacy attribute names, the database, job runner, search index and PDF library are all **Deferred** (Spine *Deferred* table). Never invent them; name the property you need and mark the mechanism as a platform dependency.

What does exist:

1. **Throwaway POC** in `poc/` — TypeScript, Node ≥ 20, ESM (`"type": "module"`, `.js` import suffixes), strict `tsc` with `noUncheckedIndexedAccess`, Vitest, Express. In-memory, no TEQ link. Built by the AI-DLC `poc` intent (`aidlc/spaces/default/intents/261004-poc/`; requirements FR1–FR8 in `inception/requirements-analysis/requirements.md`, plan + decisions D1–D7 in `construction/code-generation/code-generation-plan.md`). All plan steps are done; the intent's stages are complete (build-and-test passed, 44 tests in 8 files).

   | Layer | Files | Role |
   |---|---|---|
   | Domain | `poc/src/domain/types.ts`, `money.ts`, `store.ts`, `clock.ts` | Types and `DomainError` codes; `round2` money; in-memory `Store`; forward-only demo clock |
   | Domain | `poc/src/domain/trips.ts` | The only status writer: `ALLOWED_TRANSITIONS` + `transition()`, create, accept, reject, cancel, mark complete, `advanceTime` |
   | Domain | `poc/src/domain/views.ts`, `invoices.ts`, `dashboard.ts`, `tabCheck.ts` | Visibility + lists, invoice lifecycle, needs-your-action, Active + Closed = All check |
   | Web | `poc/src/web/app.ts`, `views.ts`, `html.ts` | Express routes, server-rendered HTML with escaping |
   | Entry | `poc/src/seed.ts`, `poc/src/server.ts` | Scripted demo history; `npm start` on port 3000 |

   Commands (run in `poc/`): `npm test` (`vitest run`), `npm run typecheck` (`tsc --noEmit`). Per-file commands are in `…/code-generation/unit-test-instructions.md`.

2. **UX prototype** — plain JS in `docs/planning-artifacts/ux-designs/ux-busnetwork-2026-08-26/prototype/` (`app-core.js`, `app-request.js`, `app-invoices.js`, `data.js`, …), built to one file by `build-single-file.py`. It follows the spec more closely than the POC (shared `queryTrips`, `ACTIVE_SET`/`CLOSED_SET`, WA-01 partner status). Its simplifications are listed in its `README.md`.

### POC deviations from the spec (intentional for a throwaway; never copy into R1 code)

| Topic | POC | R1 spec |
|---|---|---|
| Status values | Display strings `'In progress'` | Codes `IN_PROGRESS` etc.; labels via i18n (contract §3.1) |
| Share request state | `Open/Accepted/Rejected/Withdrawn`; no expiry | `PENDING/ACCEPTED/REJECTED/WITHDRAWN/EXPIRED` + withdraw sub-reason (contract §3.2) |
| Money | JS floats in NOK, `round2` | Integer minor units + ISO 4217, host currency (DR-16, contract §4) |
| Rates | Fractions (`0.85`, VAT `0.25`) | Percent (`rate ÷ 100`, `vat_rate ÷ 100`) |
| Company side | Fixed `role: 'host' \| 'partner'` per company | Side is per trip; a company can be host on one and partner on another (BRD §5) |
| Reject | No reason | Reason required (BN-ACT-05) |
| Partner after reject/withdraw | Trip disappears from that partner (D1) | Partner keeps seeing it with a company-view status (WA-01) |
| Declined invoice | Resubmitted in place (D4) | New version v2, v3… (WA-11) |
| History | Status changes only | Full audit entry with before/after, same transaction (NFR-04, AR-07) |
| Deadline / expiry, roles, departments, notifications, audit, TEQ link | Out of scope | Required (see §5) |

## 3. Domain terminology

From BRD §6 unless noted.

- **Host company** — owns the customer booking and shares the trip (legacy: "Contractor").
- **Partner company** — receives the request and runs the trip (legacy: "Subcontractor", "target company").
- **Affiliation** — an accepted partnership between two companies; only affiliated partners can receive requests (BR-02). Managed in *Planning › BusNetwork Settings*; the portal **reads, never edits** it (v1-boundaries §2).
- **Price agreement** — `PERCENTAGE` · `FULL_DAY` · `HALF_DAY` · `NONE`.
- **Customer price** — what the host charges its customer. Host-only (BR-04).
- **Offer price** — what the host pays the partner; one per partner.
- **Network trip** — the shared trip. **Trip ID = TEQ trip ID**, same in both companies' views.
- **Share request** — one per partner per trip, with its own state (PRD App. B.1). The trip status and the share-request states are two separate records.
- **Company-view status** — what a partner sees, derived from its own share request (FR-079, WA-01).
- **Normal trip** — from, ≤ 8 via stops, to. **Fixed trip** — shifts with sub-trips.
- **Invoice / claim** — partner → host request for payment on a Completed trip ("claim" in legacy Claim Settlement).
- **Side / direction** — `SHARED` (company is host) / `RECEIVED` (company is partner).
- **PAX** — passenger count.

### Mapping common requests to the documented model

| You may be asked about | Documented concept |
|---|---|
| Partner affiliations | Read-only input from BusNetwork Settings; partner picker (BN-REQ-03, FR-023); re-checked at submit (ES-09) |
| Trip sharing | Request form + T1 submit (BN-REQ-*, FR-017..035) |
| Offer acceptance / rejection | Share-request transitions T2, T3a–c (App. B.2) |
| Trip "materialisation" | **Not a documented term.** Closest: T1 creates the network trip and writes the TEQ back-link in the same submit (BN-REQ-09, ES-28); after accept the partner may create a quotation in its own TEQ account, linked to the Trip ID (BN-ACT-06, FR-080). Ask before assuming more. |
| Operational synchronization | **Not a documented term** (and "Synchronization Contract" is the withdrawn design). Closest: scheduler transitions T3c/T5/T6 (App. B.4), the nightly consistency check that flags and never overwrites (AR-12), and coexistence with legacy screens over shared service data (AR-11). |
| Settlement | Invoice lifecycle I1–I6, Invoice List (BN-INV-*, FR-081..095) |

## 4. Architecture

Paradigm (Spine): **portal UI → BusNetwork application services → Bus Network service + TEQ integration adapters.** UI holds no business rules; every rule is re-checked on the server. Adapters hold no business rules. Services never call the UI.

Components (Spine *Structural seed*): C-01 Portal UI · C-02 List query (one builder) · C-03 Trip lifecycle (state machine, **only status writer**) · C-04 Request & share · C-05 Pricing · C-06 Comments · C-07 History & audit · C-08 Invoices · C-09 Notifications (outbox) · C-10 Scheduler jobs · C-11 Dashboard aggregates · C-12 Export · C-13 Integration adapters · C-14 Consistency check · C-15 AuthZ & scope · C-16 Migration & analytics.

External systems (BRD §13, PRD App. D): Bus Network service, TEQ Sales/Planning, TEQ Company Settings (currency, VAT, language), BusNetwork Settings (affiliations, agreements), Google Maps, TEQ Scheduler, S3, notification channels, TEQ login.

### Invariants (Spine AR-01..12) — the load-bearing rules

- **AR-01 One status, one writer.** One stored trip `status`, one share-request `state`; only C-03 changes them, only via T1–T7; each transition is one transaction: guard → write → audit entry → notification intents. No transitions out of `COMPLETED`, `CANCELLED`, `REJECTED`.
- **AR-02 Lists add up.** Every list, badge, count, dashboard figure and export uses one query builder and one filter object; Active / Closed / All differ only by status set. `ACTIVE_SET`/`CLOSED_SET` are defined once.
- **AR-03 First accept wins atomically.** One conditional write; zero rows changed → `ALREADY_TAKEN` / `REQUEST_EXPIRED` / `REQUEST_CANCELLED`; other `PENDING` → `WITHDRAWN(OTHER_PARTNER_ACCEPTED)` in the same transaction. Mechanism depends on the service storage (deferred).
- **AR-04 AuthZ and scope in the query layer.** C-15 resolves user → company → roles → departments into a scope object; no unscoped read API; out-of-scope reads return **not found**. One declarative action matrix for UI and server.
- **AR-05 Field visibility on the server.** Disallowed fields are **absent from payloads**, exports, PDFs and notifications — not merely hidden in the UI.
- **AR-06 UTC + minor units.** One time utility, one money function.
- **AR-07 Audit in the same transaction**, append-only, 5-year retention.
- **AR-08 Idempotent scheduler and commands** (idempotency key; re-runs find nothing to do; > 5 min lateness alerts).
- **AR-09 Notifications after commit via outbox**, never blocking or rolling back the action, deduped.
- **AR-10 Invoice snapshot at Approve/Decline**; lists, PDFs, sums read the snapshot.
- **AR-11 Legacy coexistence.** Legacy *Sales › Network* screens must behave unchanged; portal data is additive; shared-service changes must be backward compatible and covered by legacy regression tests.
- **AR-12 Consistency check flags, never overwrites.**

Typed error codes (Spine *Consistency conventions*): `ALREADY_TAKEN`, `REQUEST_EXPIRED`, `REQUEST_CANCELLED`, `TRIP_CLOSED`, `NOT_ALLOWED`, `NOT_FOUND`, `INVOICE_EXISTS`, `TRIP_NOT_COMPLETED`, `VALIDATION_FAILED(field, message)`. User messages are in PRD §12.

## 5. Core business rules and workflows

### Trip lifecycle (BRD §7, PRD App. B.2)

| # | From → To | Actor | Guard | Side effects |
|---|---|---|---|---|
| T1 | — → REQUESTED | Host Sales/Admin | Step validation; ≥ 1 partner with **accepted** affiliation (BR-02); every offer price > 0 | Requests `PENDING`; TEQ trip marked shared; history; N-01 |
| T2 | REQUESTED → ACCEPTED | Partner Coord./Admin | Trip REQUESTED **and** this request `PENDING`; deadline not passed | Others → `WITHDRAWN`; N-02, N-03; history |
| T3a | (request) PENDING → REJECTED | Partner Coord./Admin | Reason given | If no `PENDING` left → T3b |
| T3b | REQUESTED → REJECTED | System | All requests REJECTED/WITHDRAWN/EXPIRED | Reason "Rejected by all partners"; N-02 |
| T3c | REQUESTED → REJECTED | Scheduler | `now ≥ response_deadline`, no acceptance | Pending → `EXPIRED`; reason "Expired"; N-02 |
| T4 | REQUESTED/ACCEPTED → CANCELLED | Host or partner (Sales, Partner Coord., Admin) | Reason given; partner only if its request is `ACCEPTED` | Pending → `WITHDRAWN`; N-04 (SMS if start < 24 h) |
| T5 | ACCEPTED → IN_PROGRESS | Scheduler | `now ≥ planned_start` | history |
| T6 | IN_PROGRESS → COMPLETED | Scheduler (behind a setting, Q5) | `now ≥ planned_end` | `closed_at`; history |
| T7 | IN_PROGRESS → COMPLETED | Partner Coord./Admin (WA-05) | — | `closed_at`; history |

Refused: anything out of a closed status (BN-CLS-06, Q3); cancel from IN_PROGRESS (PQ-08, ES-05); accept/reject on a non-pending request. Every transition writes history.

**Tab placement:** Active = REQUESTED, ACCEPTED, IN_PROGRESS; Closed = COMPLETED, CANCELLED, REJECTED; All = both. For identical filters, All = Active + Closed (BR-01, BN-ALL-03).

**Company-view status for partners** (WA-01, PQ-01 — blocking): `PENDING` → Requested · `ACCEPTED` → trip status · `REJECTED` → Rejected · `EXPIRED` → Rejected ("Expired") · `WITHDRAWN` → Cancelled (with reason). Computed in the same list builder (AR-02).

**Action matrix** (FR-069, roles from FR-101): Requested·received → Accept, Reject. Requested·shared → Edit, Cancel. Accepted·either → Cancel, Comment. In progress·either → Comment; received also Mark complete. Completed·received → Create invoice (Finance/Admin, WA-04). Any closed → Comment. Any → View, Export.

### Sharing and pricing (BN-REQ-*, contract §4)

- Four-step form; partner picker shows **accepted affiliations only**; affiliation re-checked at submit (ES-09).
- Offer price per partner: `PERCENTAGE` → `round(customer_price × rate ÷ 100)`; `FULL_DAY`/`HALF_DAY` → agreed rate; `NONE` → 0, user must enter a price (ES-08). Override is recorded with the user (BN-REQ-05, NFR-04).
- Submit writes network trip + TEQ back-link together; if either fails, nothing is created (BN-REQ-09, ES-28, DR-05). Re-sharing an already-shared TEQ trip is blocked (WA-30).
- After acceptance, a price change needs both companies: host proposes, partner confirms (BR-05, WA-21).

### Settlement (BRD §9.6, PRD App. B.3)

`DRAFT → PENDING → APPROVED | DECLINED`; Declined → edit and resubmit as a new version (WA-11). Only COMPLETED trips can be invoiced; at most one non-Declined invoice per trip (BR-06, BN-INV-03). Prefill offer price + additional costs, VAT from the partner's settings (BN-INV-04). Decline needs a reason. Approve/Decline locks a snapshot (AR-10). Line `net = round(qty × unit_price)`, `vat = round(net × vat_rate ÷ 100)`, totals = sums of rounded lines (DR-17). Only Draft invoices may be deleted, by their own company (WA-23). Number format `BN-INV-YYYY-NNNNNN` (WA-24).

### Scheduler (PRD App. B.4)

Every minute: start trips (T5), complete trips (T6, behind a setting), expire requests (T3c), 2-hour expiry warning (N-05 once). Daily 02:00 CET: consistency check. Due within 5 min (DR-07); idempotent (DR-08). Fixed trips use first sub-trip start / last sub-trip end (WA-09).

### Consistency with the TEQ trip (contract §1, AR-12)

Nightly, for open trips only, compare planned start/end/return, from, vias, to, PAX, trip type, shift/sub-trip times. A difference creates a **consistency flag** (field, both values, checked at), shown on the detail page (partner sees only flags on fields it may see). Nothing is overwritten. The flag resolves when a later check finds the values equal.

## 6. API, data and cross-tenant considerations

- **No real API exists.** Describe changes at the capability level (SC-*, C-*) and use the entity sketch in the Spine and PRD App. C (`DE-01..13`) as the business model, not as a schema. Mark anything platform-specific as dependent on D-1 (service API/data model).
- **Canonical values** (contract §3): upper snake case codes used unchanged in API, storage, analytics and exports; labels via i18n keys such as `bn.status.REQUESTED`.
- **IDs:** Trip ID = TEQ trip ID; invoice no. + version; share-request and comment IDs opaque.
- **Time:** store UTC ISO 8601 `Z`; display in the user's TEQ zone as `YYYY-MM-DD HH:MM`, length `Xh Ym`; date filters 00:00:00–23:59:59 in the user's zone, converted once in one utility (BR-07, BN-LST-03).
- **Money:** integer minor units + ISO 4217; host company currency (BR-08, WA-17); half-away-from-zero to 2 decimals in one function.
- **Visibility by viewing company** (contract §2): partner never gets customer price, customer company/billing details, HQ comment, invoice comment, other partners' existence or prices, the override user name, or history about other partners/customer price. Partner does get contact name/phone, flight no., group ref., sign (WA-08, PQ-15 — blocking, DPO sign-off pending). Comment threads are per host↔partner pair.
- **Department scope** (contract §2.5, BR-09): host side by the TEQ trip's department; partner side by the receiving department configured for that affiliation, else all-department users only (WA-27). Out of scope → "not found".
- **Every read path is scoped** — lists, counts, badges, dashboard, exports, PDFs, notifications, history. Exports are audited (DR-12) and capped at 50 000 rows (WA-28).

## 7. Error handling, synchronization and data integrity

- No half-applied actions: a failed dependency leaves no partial write (DR-05). Integration outages fail the dependent function with a specific message and Retry; unrelated page parts still work (FR-108, ES-27).
- Concurrency: the first commit wins; losers get a specific, actionable error (ES-01..04, ES-20). Accept is evaluated against the latest committed version (ES-04).
- Double submits have one effect (idempotency key; ES-23, DR-08).
- Notifications never block or roll back the action; failures are retried and logged (DR-09, ES-18).
- Late scheduler jobs catch up exactly once; the UI never shows a status the scheduler has not set (ES-10).
- Closed trips are immutable on every surface (ES-06). Comments are not editable or deletable (WA-20). Audit entries are never modified.
- Logs: structured, with trip ID / invoice no. and correlation ID; **no customer personal data** (NFR-05). Analytics events carry company and role, no personal data.
- In the POC, expected failures throw `DomainError(code, message, field)`; the planned web layer maps them to HTTP 400 and logs unexpected errors as 500 (code-generation plan step 9).

## 8. Security and tenant isolation

- TEQ login; every API call checks company, role and side (NFR-03). The UI hides what's not allowed and the server refuses it regardless (DR-02).
- Side matters: Accept only on received trips; Approve only on incoming invoices (FR-101).
- Field filtering happens in server-side mappers shared by API, export, PDF and notifications (AR-05).
- Attachments: ≤ 2 files, ≤ 10 MB, PDF/JPG/PNG/DOCX, malware-scanned before sharing; downloads via signed, expiring URLs (DR-15, Spine NFR tactics).
- Never hardcode credentials; validate inputs at boundaries (construction-phase rules in `aidlc/spaces/default/memory/phases/construction.md`).
- Treat any change touching scope, visibility, the action matrix or status writes as **high risk**: it needs a negative test proving the other company (and other partners) cannot see or do it.

## 9. Testing and regression requirements

Required for any behaviour change, in addition to the AI-DLC testing posture (`aidlc/spaces/default/memory/org.md` *Testing Posture*: default test-after; `poc` scope adds no floor beyond the selected strategy and keeps the existing suite green; `mvp`/`feature`/`enterprise` add an 80% line-coverage floor; `bugfix` adds a targeted regression):

1. A test per requirement touched, named with its ID (`FR-070`, `AC-ACT-07.2`, POC `FR3.6`…). Tests cover the happy path plus at least two error/edge cases; never assertion-free tests (`phases/construction.md`).
2. Regression checks whenever lifecycle, lists or scope change:
   - **Tab placement / reconciliation:** every trip in exactly one of Active/Closed and always in All; All = Active + Closed for the same filters (BN-ALL-03, POC FR6.2).
   - **Lifecycle:** each T1–T7 allowed; every other transition refused; closed statuses final.
   - **First accept wins:** concurrent accepts → exactly one `ACCEPTED` (SPEC SC-05 calls for a 20-way concurrent test).
   - **Visibility:** for each company pair and each partner on a trip, forbidden fields absent from the payload (AC-SCOPE.1, AC-DTL-01.2, POC NFR1).
   - **Money:** rounding edge cases (e.g. `1.005 → 1.01`), the BRD example `20 000 × 85 % = 17 000`, totals = sum of rounded lines.
   - **Time:** cross-time-zone date filters and day boundaries (ES-22).
   - **Authorization:** endpoint × role × side (NFR-010).
   - **Legacy coexistence:** shared-service changes keep legacy Sales › Network regression tests green (AR-11).
3. Use injected time (the POC's store clock / `advanceTime`), never wall-clock sleeps, for scheduler behaviour.
4. Run `npm test` and `npm run typecheck` in `poc/` before claiming POC work is done; report failures verbatim.

## 10. Known limitations and unresolved questions

Open business decisions (BRD §15, PRD App. J). Build the documented interim behaviour, keep it isolated (config or one module), and never hardcode an answer as if decided.

| ID | Question | Interim behaviour |
|---|---|---|
| Q1 | Invoice List replaces Claim Settlement? | Coexistence |
| Q2 | *Paid* invoice status? | Four statuses only |
| Q3 | Reopen closed trips? | No |
| Q4 | First accept wins vs host chooses? | First accept wins |
| Q5 | Auto-complete at planned end? | Automatic (behind a setting) + manual Mark complete |
| Q6 | Default response deadline? | Defaults to planned start (WA-10) |
| Q7 | Partner names in charts? | Shown |

**Blocking for R1:** PQ-01 (partner view of withdrawn/expired), PQ-02 (main tabs as visibility rule), PQ-04 (who handles invoices), PQ-10 (deadline default), PQ-15 (customer data to partners), plus PQ-13 for finance (VALIDATION-REPORT F-3). **Sequencing:** BN-REQ-08 (deadline) is *Should* but recommended into R1 (v1-boundaries §1).

**Dependencies not in the workspace:** TEQ stack and conventions; Bus Network service API and data model (D-1); legacy active/archive and claim attribute names (migration, WA-29); concurrency mechanism for AR-03; push/SMS channel APIs (D-3); support-ticket tags for M-5 (D-4).

**Other known gaps:** BRD sign-off table is unsigned; SPEC/Spine cite PRD v1.0 section numbers (use Appendix K); the POC diverges from the spec as listed in §2.

When a needed rule is silent in the BRD, propose a new `PQ-nn` with a working assumption instead of changing BRD wording.

## 11. Making a change safely

1. **Locate the requirement.** Find the BN-*/FR-*/BR-* IDs the change touches; read the BRD row, then the PRD FR, its AC-*, and related ES-* rows. Check whether a Q/PQ affects it.
2. **Classify the change:** implemented behaviour (POC/prototype), specified-but-unbuilt (R1 docs), or a new proposal. Say which in your answer; proposals are labelled *Proposed*.
3. **Check the invariants** AR-01..12 the change touches. A change that needs a second status writer, a second list predicate, an unscoped read, or UI-only filtering is wrong; redesign.
4. **Confirm the target surface.** POC work follows the POC requirements and decisions D1–D7, even where they diverge from R1; R1 design work follows the spec. Never mix the two silently.
5. **Inspect the existing code** in the area and copy its patterns: ESM `.js` imports, `DomainError` with a field, validation at the domain boundary, the single `transition()` for status changes, `round2`/`lineTotals` for money, one-line doc comments citing requirement IDs.
6. **Make the smallest change** that satisfies the requirement. No unrelated refactors, renames or "improvements".
7. **Write or update tests** per §9, then run `npm test` and `npm run typecheck` in `poc/`.
8. **Report** what changed, which IDs it satisfies, test results, and any assumption or open question it depends on.
9. **AI-DLC:** if an intent is active (`aidlc/spaces/default/intents/active-intent`), work through the `/aidlc` workflow and its gates rather than around them. Don't edit `aidlc-state.md` or memory files by hand.
