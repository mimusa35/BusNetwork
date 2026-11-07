---
id: VALIDATION-busnetwork-BN-2026-09-16
date: 2026-09-16
scope: BN-BRD-001 ↔ BN-PRD-001 ↔ BN-SPEC-001 ↔ BN-ARCH-001 ↔ UX package ↔ prototype
auditor: coherence review after the realignment to the BusNetwork BRD artifact
status: PASS — final; 6 open decisions and 1 sequencing recommendation, all named
---

# Validation report — BusNetwork portal

The BRD, PRD and every downstream artifact were rebuilt on 2026-09-15/16 to follow the BusNetwork BRD artifact **BN-BRD-001** exactly. This report records what was checked, how, and what it found.

**TL;DR.** The set is coherent: one BRD, one PRD covering all 66 of its requirements with acceptance criteria, a SPEC and Architecture Spine that carry the BRD's own rules as invariants, a UX package and a working prototype built from the same IDs. No older, conflicting material remains in the workspace. What remains open is business decisions — the BRD's seven questions plus six PRD questions marked blocking — not artifact conflicts.

**Audited at finalization (all 2026-09-16):** BRD v1.0, PRD v1.0, SPEC v1.0 with its two companions, Architecture Spine v1.0, DESIGN / EXPERIENCE / SCREENS v1.0, and the prototype.

---

## Check 1 — Does the BRD follow the artifact?

**Method.** The artifact was read in full and transcribed section by section into `BRD.md`, then compared back.

**Verdict: PASS.** All 16 sections are present in the artifact's order with the artifact's wording: executive summary; background; OBJ-1..5 with metrics and targets; scope in/out; five roles and the permission matrix; glossary; navigation and lifecycle (six statuses, the tab each belongs to, the status-change table); shared list behaviour (BN-LST-01..10) and standard columns; the six module sections; BR-01..09; the eight notifications; NFR-01..08; integrations; assumptions, constraints and risks; Q1..Q7; revision history and sign-off.

**Counts reconciled:** 66 functional requirements — BN-LST 10, BN-DSH 8, BN-REQ 10, BN-ACT 9, BN-DTL 6, BN-CLS 7, BN-ALL 6, BN-INV 10 — of which **50 Must, 12 Should, 4 Could**. (The PRD's first draft said 76/60; corrected.)

**Additions to the file, none of them requirements:** frontmatter, a source-of-truth note, a contents list, and a Mermaid state diagram that restates the §7 status-change table. The document control block, priorities and IDs are the artifact's.

---

## Check 2 — Does the PRD cover the BRD?

**Method.** A script extracted every `BN-*` ID from the BRD and checked each one against the PRD body, the §18.1 traceability matrix, and the §13 acceptance criteria.

**Verdict: PASS.**

| Element | Result |
|---|---|
| 66 functional requirements in the PRD body | 66 / 66 |
| …in the traceability matrix with slice, UX screen and architecture component | 66 / 66 |
| …with at least one `AC-<id>` acceptance criterion | 66 / 66 |
| BR-01..09 with an enforcement point and a test in §8 | 9 / 9 |
| NFR-01..08 with a measurable acceptance method in §9 | 8 / 8 |
| OBJ-1..5 with a formula and instrumentation (M-1..M-5, TM-01..13) | 5 / 5 |
| §11 notifications as N-01..N-08 with recipients, channels and text | 8 / 8 |
| Q1..Q7 carried with the interim behaviour the PRD builds | 7 / 7 |

---

## Check 3 — Contradictions across the set

**Method.** Load-bearing claims were traced through BRD → PRD → SPEC → Architecture → SCREENS → prototype.

**Verdict: PASS — no contradictions found.** Spot checks:

1. **One status decides the tab.** BR-01 → PRD §6 and §8 → SPEC SC-05 → Architecture AR-01 (single stored status, single writer) and AR-02 (one query builder) → SCREENS S-03..S-05 → prototype: `queryTrips` differs only by status set, and `ACTIVE_SET`/`CLOSED_SET` are defined once.
2. **Active + Closed = All.** BN-ALL-03 → AC-ALL-03.1 → AR-02 → prototype count line. Verified by running eight filter combinations against the sample data: every one reconciles.
3. **First accept wins.** BR-03 / BN-ACT-07 → PRD T2 and DR-04 → AR-03 (atomic conditional write) → prototype: a second accept returns "Already taken", exactly one request ends `ACCEPTED`.
4. **Pricing.** BN-REQ-05 formula and BR-08 rounding → PRD §7.3 → data-sharing-contract §4 → prototype: customer price 20 000 at 85% gives 17 000,00; an override records the user.
5. **Only Completed trips can be invoiced.** BR-06 / BN-INV-03 → PRD I1 guard → SC-07 → prototype refuses a second non-declined invoice and offers "Edit & resubmit" as v2 after a decline.
6. **What a partner may see.** BR-04 / NFR-05 → PRD §7.5 and §7.10 → data-sharing-contract §2 → AR-05 (server-side filtering) → SCREENS S-12 → prototype: customer price, customer company, HQ comment, invoice comment and other partners' prices are absent from the partner's rendering.
7. **Amounts lock at approval.** BN-INV-07 → PRD §7.8 → AR-10 → prototype snapshots lines at the decision.

---

## Check 4 — Did anything out of scope leak in?

**Verdict: PASS.** Every PRD section traces to a BRD ID; derived requirements (DR-nn) and working assumptions (WA-nn) each cite the BRD text they come from. The BRD's out-of-scope list is repeated unchanged in PRD §3.2, SPEC *Non-goals* and `v1-boundaries.md` §2, with the destination for each item (agreements stay in BusNetwork Settings, vehicles and drivers in Planning, accounting and payments with each operator). The prototype builds no capability outside BRD §4.

---

## Check 5 — Is any conflicting older material left?

**Method.** Grep across `docs/` (project knowledge and every planning artifact) for the vocabulary of the earlier design — Trip Commitment, Synchronization Contract, CAP-1..6, AD-0..12, derived status, disputes-as-events, hand-raise, the 21-event mirror — and for links to files that no longer exist.

**Verdict: PASS — none.** At finalization the earlier planning set was deleted from the workspace rather than kept alongside the current one: the superseded BRD, PRD, SPEC and companions, Architecture Spine, gate-inspection report, UX package and prototype; the brainstorming artifacts that produced that design; and the per-artifact memlogs, which were rewritten to describe only the current documents. Every remaining occurrence of "withdrawn" is the share-request state from `data-sharing-contract.md` §3.2. No document links to a file that is not present.

---

## Check 6 — Does the prototype match the specification?

**Method.** The five modules were loaded in Node with a stub DOM; every screen was rendered for all ten personas, and a full lifecycle was driven end to end.

**Verdict: PASS.** 722 render checks with no errors and no `undefined`/`NaN` leaking into output. Verified behaviour: share to two partners with one overridden price; first-accept-wins including the loser's message; the withdrawn partner seeing **Cancelled · Another partner accepted** (PRD §6.2 / WA-01); scheduler moving Accepted → In progress → Completed on the demo clock; invoice prefill, submission, approval and totals (1 680 000 + 120 000 ferry → net 1 800 000, VAT 450 000, total 2 250 000); BN-ALL-03 reconciliation.

**Deliberate simplifications** (listed in the prototype README): Google Maps is a fixed address list, department scoping is not simulated, PDF uses the browser print dialog, XLSX explains that the real export is server-side, and there is no persistence.

---

## Findings

### F-1 — The artifact's own tensions, carried as questions rather than silently resolved

None of these is a defect in the BRD; each is a place where the BRD is silent or uses two phrasings, and where the PRD must build something. Each is a PRD working assumption with a matching question (PRD §17.2).

| # | Tension in the BRD | PRD working assumption | Question |
|---|---|---|---|
| 1 | One status per trip (BR-01), but a request can go to several partners who answer separately (BN-REQ-04, BN-ACT-05/07) | A share request per partner; the partner's status is derived from its own request — withdrawn → Cancelled, expired → Rejected | **PQ-01, blocking** |
| 2 | §5 names each role's "main tabs"; §7 hides tabs a user can't open | "Main tabs" is emphasis, not a hard visibility rule | **PQ-02, blocking** |
| 3 | BN-CLS-04 says "a partner user" creates invoices; §9.6 says Draft is acted on by "Partner (Finance)"; the permission matrix has no invoice-creation row | Finance and Admin of the partner company | **PQ-04, blocking** |
| 4 | §7 says Completed is triggered by "System / Partner"; the matrix has no *Mark complete* row | Partner Coordinator and Admin | PQ-05 |
| 5 | BN-REQ-08 makes the deadline optional, so a Requested trip whose start passes has no exit | The deadline defaults to the planned start | **PQ-10, blocking** (with Q6) |
| 6 | BR-04 allows the partner what is "needed to run the trip" without naming the fields | Contact person name and phone, sign, group ref., flight no. | **PQ-15, blocking** (DPO sign-off) |
| 7 | BR-08 says host currency; §9.6 columns say "company currency" | All trip and invoice amounts in the host's currency | PQ-13 |
| 8 | The dashboard tile "Active trips" is Accepted + In progress; the Active Trips badge counts all open trips | Both kept as written, with the tile's definition on the tile | noted in PRD §7.2 |
| 9 | §7 has no transition out of In progress except completion | An in-progress trip can't be cancelled | PQ-08 |
| 10 | "Planned start/end" is ambiguous for fixed trips made of shifts | First sub-trip start, last sub-trip end | PQ-09 |

### F-2 — Sequencing recommendation

**BN-REQ-08 (response deadline) is *Should*, but three *Must*-level things depend on it:** OBJ-2 (fewer unanswered requests), the "Request expiring in 2 h" notification in §11, and the only exit from Requested when nobody answers. Recommendation to the Product Owner: pull it into R1. The BRD priority is left unchanged.

### F-3 — Decisions that should close before build starts

BRD **Q1–Q7**, and PRD **PQ-01, PQ-02, PQ-04, PQ-10, PQ-15** (and PQ-13 for finance). Q5 (automatic completion) and Q6 (deadline default) are built behind configuration so either answer is cheap; Q3 (reopening) and Q4 (host chooses among acceptors) would change the state machine and should be answered before R1 is estimated.

### F-4 — Dependencies the workspace cannot supply

The Bus Network service data model and API, the legacy active/archive and claim attribute names needed to finish the migration mapping (PRD §15.2), TEQ's stack and conventions, and the push/SMS channels. These are named in the Architecture Spine's *Deferred* table under AR-00 rather than invented.

---

## Summary

| Check | Verdict |
|---|---|
| 1 — BRD follows the artifact | **PASS** (16 sections, 66 requirements, counts reconciled) |
| 2 — PRD covers the BRD | **PASS** (66/66 with traceability and acceptance criteria) |
| 3 — Cross-artifact contradictions | **PASS** (none found; 7 load-bearing chains traced) |
| 4 — Out-of-scope leakage | **PASS** (no capability outside BRD §4) |
| 5 — No conflicting older material | **PASS** (earlier planning set deleted; no dangling links) |
| 6 — Prototype conformance | **PASS** (722 render checks, lifecycle and reconciliation verified) |

**Recommendation.** Put BN-BRD-001 v1.0 to the stakeholders named in §16 with the F-1 questions attached, since six of them change what the build does. The PRD, SPEC, Architecture Spine and UX package can be reviewed in parallel; they will need no restructuring once the answers land, only the working assumptions replaced by decisions.
