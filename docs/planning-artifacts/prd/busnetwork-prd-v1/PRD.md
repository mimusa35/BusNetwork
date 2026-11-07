---
id: BN-PRD-001
title: BusNetwork — Product Requirements Document
product: TEQ · BusNetwork
version: 2.0
status: final
status_label: Final
classification: Internal
created: 2026-09-15
updated: 2026-09-18
finalized: 2026-09-18
implements: BN-BRD-001 v1.0
source_of_truth: ../../brd/busnetwork-brd-v1/BRD.md
related:
  - ../../brd/busnetwork-brd-v1/BRD.md
  - ./VALIDATION-REPORT.md
  - ../../../specs/spec-busnetwork-v1-architecture/SPEC.md
  - ../../architecture/architecture-BusNetwork-2026-08-26/ARCHITECTURE-SPINE.md
  - ../../ux-designs/ux-busnetwork-2026-08-26/SCREENS.md
  - ../../../PROJECT-CONTEXT.md
---

# BusNetwork — Product Requirements Document

> **What this document is.** The PRD turns BN-BRD-001 into buildable, testable product behaviour. It adds the detail engineering, UX and QA need — module and feature structure, functional requirements, user stories, acceptance criteria, edge-case behaviour, screens and priorities — and nothing that changes the BRD.
>
> **Precedence.** BRD › PRD › SPEC / Architecture › UX. If this PRD appears to contradict the BRD, the BRD is right and this PRD has a defect.

| Document ID | Version | Date | Status | Implements | Classification |
|---|---|---|---|---|---|
| `BN-PRD-001` | 2.0 — Final | 18 Sep 2026 | Final · 7 BRD questions (Q1–Q7) and 22 PRD questions (PQ-01…PQ-23; PQ-12 withdrawn) tracked | `BN-BRD-001` v1.0 | Internal |

## 0. How to read this document

### 0.1 Identifier scheme

| Label | Meaning | Owner |
|---|---|---|
| `BN-LST/DSH/REQ/ACT/DTL/CLS/ALL/INV-nn` | Business requirement from BRD §8–§9, cited unchanged. In the traceability matrix these are the **BR IDs**. | BRD |
| `BR-01…BR-09` | Business rule from BRD §10. | BRD |
| `NFR-01…NFR-08` | Non-functional requirement from BRD §12. | BRD |
| `OBJ-1…OBJ-5` · `Q1…Q7` | Business objective · open business question, BRD §3 / §15. | BRD |
| **`MOD-nn`** | Product module (§4). | PRD |
| **`FEAT-nn`** | Product feature (§5, §8). | PRD |
| **`FR-nnn`** | Functional requirement — what the system must do (§6). | PRD |
| **`NFR-nnn`** | Product-level non-functional requirement, each implementing a BRD `NFR-0n` or derived from one (§7). Three digits; never confuse with the BRD's two-digit IDs. | PRD |
| **`EP-nn` · `US-nnn`** | Epic · user story (§9). | PRD |
| `AC-<area>-<req>.<n>` | Acceptance criterion (§10). The scheme from v1.0 is kept so SPEC, Architecture and UX citations still resolve. | PRD |
| `ES-nn` | Edge case / error scenario (§12). IDs kept from v1.0. | PRD |
| `UJ-nn` | User journey (§13). IDs shared with the UX package. | PRD |
| `S-nn` | Screen (§14). IDs shared with `SCREENS.md`. | PRD / UX |
| `DR-nn` | **Derived requirement** — behaviour the BRD makes necessary but doesn't spell out (Appendix I). Not new scope. | PRD |
| `WA-nn` / `PQ-nn` | **Working assumption** where the BRD is silent, with the question that must confirm it (Appendix J). A WA never overrides a BRD statement. | PRD |
| `DE-nn` · `N-nn` · `M-n` · `TM-nn` · `T1…T7` · `I1…I6` | Data entity · notification · success metric · analytics event · trip transition · invoice transition (Appendices B–F). | PRD |
| `R1 / R1.1 / Later` | Release slice from the BRD's MoSCoW priority: Must → R1, Should → R1.1, Could → Later (§15). | PRD |

### 0.2 Rules this document follows

1. The BRD is the only source of business requirements. Nothing here adds scope beyond BRD §4.
2. Anything the BRD does not state is labelled `Assumption` (WA), `Open Question` (PQ / Q) or `Proposed` — never presented as a confirmed requirement.
3. No numerical target is invented. Targets come from BRD §3 and §12; anything else is marked `Proposed`.
4. Every business requirement reaches a module, a feature, a functional requirement, a story, an acceptance criterion and a screen (§16).
5. Requirement IDs are never reused. A withdrawn item keeps its ID and is marked withdrawn.

### 0.3 Contents

| § | Section |
|---|---|
| 1 | [Product vision](#1-product-vision) |
| 2 | [Product users and personas](#2-product-users-and-personas) |
| 3 | [Stakeholders](#3-stakeholders) |
| 4 | [Product modules](#4-product-modules) |
| 5 | [Feature identification](#5-feature-identification) |
| 6 | [Functional requirements](#6-functional-requirements) |
| 7 | [Non-functional requirements](#7-non-functional-requirements) |
| 8 | [Product features — catalogue](#8-product-features--catalogue) |
| 9 | [User stories and product workflows](#9-user-stories-and-product-workflows) |
| 10 | [Acceptance criteria](#10-acceptance-criteria) |
| 11 | [Business rules → feature constraints](#11-business-rules--feature-constraints) |
| 12 | [Edge cases → feature behaviour](#12-edge-cases--feature-behaviour) |
| 13 | [User journeys](#13-user-journeys) |
| 14 | [Screen inventory](#14-screen-inventory) |
| 15 | [Prioritization — MoSCoW](#15-prioritization--moscow) |
| 16 | [Traceability matrix](#16-traceability-matrix) |
| 17 | [PRD validation summary](#17-prd-validation-summary) |
| 18 | [Appendices A–L](#18-appendices) |

---

## 1. Product vision

### 1.1 Product purpose

BusNetwork is one portal inside the TEQ Platform where bus operators **share trips with partner companies, follow each trip until it is finished, and settle what each side owes** (BRD §1). It replaces four scattered TEQ areas — *Sales › Network*, *Sales › Network Trips*, *Planning › BusNetwork Settings* and *Invoice › Claim Settlement* — with six tabs in one navigation bar: **Dashboard · Request · Active Trips · Closed Trips · All Trips · Invoice List**.

The exchange itself already works. The product's purpose is to make it **visible, trustworthy and finishable in one place**, governed by one rule: *a trip has exactly one status, and that status alone decides which tab shows it* (BR-01).

### 1.2 Problem statement

From BRD §2 — four problems, all about how people use features that already exist:

| ID | Problem | Consequence today |
|---|---|---|
| PB-1 | **Fragmented navigation** — sharing, tracking and settlement sit in three modules | No user can follow one trip from start to finish in one place |
| PB-2 | **No overview** — no screen shows what is waiting, what runs today, what needs approval | Requests expire unanswered; work is found by memory |
| PB-3 | **Unclear trip status** — "active" and "archive" mean different things per screen | Users cannot tell whether a trip is still open; support tickets follow |
| PB-4 | **Settlement separate from trips** — claims live apart from the trips they belong to | Hard to see what is owed for a given trip; slow settlement |

### 1.3 Product goals

| ID | Product goal | Answers | Made true by |
|---|---|---|---|
| PG-1 | One portal covers the whole exchange: share → follow → settle | PB-1 | MOD-01…MOD-07 |
| PG-2 | Every user lands on a page that tells them what needs their action now | PB-2 | MOD-02, FEAT-06 |
| PG-3 | One status per trip, one tab per status, lists that always reconcile | PB-3 | FEAT-35, FEAT-22, BR-01 |
| PG-4 | Settlement starts from the Completed trip and is prefilled | PB-4 | MOD-07, FEAT-36 |
| PG-5 | Nothing a partner may not see ever reaches a partner's screen or API response | BR-04, NFR-05 | FEAT-47 |

### 1.4 Business objectives

Unchanged from BRD §3. Measurement formulas are in Appendix F (M-1…M-5).

| ID | Objective | Success metric | Target | Metric |
|---|---|---|---|---|
| OBJ-1 | Make it faster to hand a trip to a partner | Median time from creating a request to partner acceptance | −30% within 6 months | M-1 |
| OBJ-2 | Reduce lost revenue from requests nobody answers | Share of requests that expire with no response | < 10% | M-2 |
| OBJ-3 | Speed up settlement between companies | Median days from trip closed to invoice approved | ≤ 7 days | M-3 |
| OBJ-4 | Give users one place to work | Network tasks done without leaving the portal | ≥ 90% | M-4 |
| OBJ-5 | Make lists trustworthy | Support tickets about a trip's status or a missing trip | −50% within 6 months | M-5 |

### 1.5 Expected product outcomes

| Outcome | Because |
|---|---|
| A Sales user shares one trip with several partners in a single form and sees, on one page, who has answered | FEAT-09, FEAT-12, FEAT-23 |
| A Partner Coordinator cannot miss an incoming request: it appears as a key figure, a "Needs your action" item, a nav badge and a notification | FEAT-04, FEAT-06, FEAT-02, FEAT-43 |
| A trip that is Requested and unanswered always has an exit (deadline, then "Expired") instead of sitting open forever | FEAT-14, FEAT-32 |
| Finance raises an invoice from the Completed trip itself, prefilled from the agreed offer price, and the host approves it from the same portal | FEAT-36, FEAT-38 |
| Active + Closed = All for identical filters, on every company's screen, verifiably | FEAT-22, AC-ALL-03.1 |
| Every status change, price override and invoice decision is attributable to a person or to "System", for five years | FEAT-48, NFR-017 |

### 1.6 Scope

Exactly BRD §4 *In scope*; each item is specified in §6 and priced into a release slice in §15.

| # | In scope | Module |
|---|---|---|
| 1 | Portal shell with six-tab navigation | MOD-01 |
| 2 | Dashboard with key figures, trips starting soon, actions waiting on the user | MOD-02 |
| 3 | Creating and sharing normal and fixed trips with partners | MOD-03 |
| 4 | Active, Closed and All Trips lists | MOD-04 |
| 5 | Trip detail page | MOD-05 |
| 6 | Partner responses: accept, reject and cancel, each with a reason | MOD-06 |
| 7 | Comment threads on each trip | MOD-05 |
| 8 | Invoice List of incoming and outgoing invoices for closed trips, with approve and decline | MOD-07 |
| 9 | Notifications for events in the trip and invoice lifecycles | MOD-08 |
| — | *Cross-cutting:* permissions, company and department scope, field-level visibility, audit, scheduled jobs, integrations | MOD-09, MOD-10 |

### 1.7 Out of scope

Exactly BRD §4 *Out of scope (this release)*. Each is `Won't Have` in §15 with the place it stays.

| Excluded | Stays with | Portal behaviour |
|---|---|---|
| Managing partner agreements and rates | *Planning › BusNetwork Settings* | Read-only: affiliations, agreement type, rate |
| Assigning vehicles and drivers | *Planning* | Vehicle **requirements** only |
| Posting invoices to accounting (Fortnox, SIE4) | Each company's accounting | Invoice List ends at Approved; PDF download (BN-INV-09) |
| Collecting and reconciling payments | Each company's finance | No *Paid* status (Q2) |
| Customer-facing booking portal changes | Existing booking portal | None |
| Mobile driver app | Not planned | None |

Also out of scope by BRD silence: anything not traceable to a BRD ID (orphan check, §16.4).

### 1.8 Success criteria

| ID | Success criterion | Measured by | Gate |
|---|---|---|---|
| SUC-1 | All 50 *Must* requirements implemented and their acceptance criteria pass | §10, §16 | R1 release |
| SUC-2 | BRD objectives OBJ-1…OBJ-5 trend to target | M-1…M-5 (Appendix F) | 6 months after GA |
| SUC-3 | Reconciliation holds: `count(All) = count(Active) + count(Closed)` for any filter set | AC-ALL-03.1 | R1 release, then nightly |
| SUC-4 | No cross-company data leak: partner responses never contain host-only fields | AC-DTL-01.2, AC-INV-cust | R1 release |
| SUC-5 | NFR-01 met at 50 000 trips per company; NFR-07 WCAG 2.1 AA passes on every screen | §7 test methods | R1 release |
| SUC-6 | Trial migration reconciles trip counts per status and claim totals per company, signed off by Finance | Appendix G | Before pilot |
| SUC-7 | Legacy retirement criterion met: M-4 ≥ 90% for two consecutive months and Q1 decided | M-4 | After R1.1 |

---

## 2. Product users and personas

Roles are BRD §5, unchanged. A company can be **host** on one trip and **partner** on another; the *side* (shared by us / received by us) is a property of the trip, not of the user. What any user can see is limited by their company and their departments (BR-09).

### P-SALES — Sales / Dispatcher

| | |
|---|---|
| **Role** | Creates requests, chooses partners, sets offer prices, follows trips their company has shared (host side). |
| **Responsibilities** | Cover trips the own fleet cannot run; pick the right partner at the right price; keep shared trips moving; cancel with a reason when the customer cancels. |
| **Goals** | Hand a trip to a partner in minutes, not hours; know immediately who has answered; never let a request lapse unnoticed. |
| **Needs** | One form that shares to several partners at once; prices calculated from each agreement with the ability to override; a clear view of who accepted, rejected or is still pending. |
| **Pain points** | Sharing, tracking and settlement in three modules (PB-1); no view of what is still unanswered (PB-2); unclear whether a trip is still open (PB-3). |
| **Permissions** | View dashboard · Create / share request · Cancel trip (reason) · Comment · Export. **Not** accept/reject, **not** invoice approval (BRD §5). |
| **Main interactions** | S-01 Dashboard → S-02 Request (4 steps) → S-03 Active Trips → S-06 Trip detail → S-09 dialogs (Cancel, Propose price change). |
| **Lands on** | Dashboard → Request / Active Trips. |

### P-PCOORD — Partner Coordinator

| | |
|---|---|
| **Role** | Handles incoming requests from other companies: accepts, rejects or comments, and follows accepted trips until they close (partner side). |
| **Responsibilities** | Answer incoming requests quickly; judge whether a vehicle and driver are available; mark trips complete; keep the host informed through comments. |
| **Goals** | See every incoming request before it expires; answer it in a few clicks; carry the accepted trip into their own TEQ planning. |
| **Needs** | Requests that are impossible to miss (figure, action list, badge, push/email) and that show the response deadline; enough trip detail to decide; one click to a quotation in their own TEQ account. |
| **Pain points** | Runs the company's own-fleet work in parallel — a request buried in a list is a request lost (PB-2); today cannot tell an open trip from a closed one (PB-3). |
| **Permissions** | View dashboard · Accept / reject incoming request · Cancel trip (reason) · Comment · Export · *Mark complete* (WA-05) · *Set alternative start address* (WA-19). |
| **Main interactions** | S-01 Dashboard → S-03 Active Trips (received) → S-06 Trip detail → S-09 dialogs (Accept, Reject, Mark complete) → S-04 Closed Trips. |
| **Lands on** | Dashboard → Active Trips. |

### P-FIN — Finance User

| | |
|---|---|
| **Role** | Partner side: creates and submits invoices for Completed trips. Host side: approves or declines incoming invoices and watches open amounts. |
| **Responsibilities** | Bill completed trips accurately and on time; check incoming invoices against what was agreed; decline with a reason when they don't match. |
| **Goals** | Find every Completed trip that still needs billing; raise an invoice that is already correct; settle within a week (OBJ-3). |
| **Needs** | A "Completed, not invoiced" filter; prefill from the agreed offer price and additional costs; VAT from company settings; amounts that stop moving once a decision is made. |
| **Pain points** | Claims managed apart from their trips (PB-4); no single figure for what is owed or owing. |
| **Permissions** | View dashboard · Approve / decline invoice · Comment · Export · *Create / edit / submit invoice* and *Download PDF* (WA-04). **Not** accept/reject requests, **not** create trip requests. |
| **Main interactions** | S-01 Dashboard → S-04 Closed Trips (Completed, not invoiced) → S-08 Invoice → S-07 Invoice List → S-09 dialogs (Submit, Approve, Decline). |
| **Lands on** | Dashboard → Invoice List / Closed Trips. |

### P-ADMIN — Company Admin

| | |
|---|---|
| **Role** | Sets up users, permissions and default settings for BusNetwork in their company. |
| **Responsibilities** | Keep roles and department scope right; maintain the company's reason lists and notification defaults; act as a fallback for any role. |
| **Goals** | The company's users see exactly what they should; nothing is blocked because a single person is away. |
| **Needs** | Every action any role can take; configuration of reason lists and notification channels (BRD §5 Admin, WA-07). |
| **Pain points** | Permission questions arrive as support tickets when tab visibility is unclear (PQ-02). |
| **Permissions** | All actions in the extended permission matrix (§6.9), plus *Configure BusNetwork defaults*. |
| **Main interactions** | All screens; typically S-01 → the screen a colleague is blocked on. |
| **Lands on** | Dashboard. |

### P-VIEW — Viewer / Management

| | |
|---|---|
| **Role** | Read-only access to the dashboard and lists for monitoring. |
| **Responsibilities** | Watch volume, partner mix and settlement; report to management; never change a trip. |
| **Goals** | Answer "how is the network doing" without asking an operator; export a period for reporting. |
| **Needs** | Key figures, charts, all six statuses in one list, export to CSV/XLSX. |
| **Pain points** | Numbers that don't add up across screens (PB-3) make reports unusable. |
| **Permissions** | View dashboard · Export lists. No create, respond, cancel, comment or invoice action (BRD §5). |
| **Main interactions** | S-01 Dashboard (with *Recent activity* instead of *Needs your action*) → S-05 All Trips → export. |
| **Lands on** | Dashboard → All Trips. |

### 2.1 Persona → permission summary

BRD §5 permission matrix, unchanged; the rows marked *WA* fill gaps the BRD leaves and each carry a question (Appendix J). Full matrix with sources in §6.9 / FR-101.

| Action | P-SALES | P-PCOORD | P-FIN | P-ADMIN | P-VIEW | Source |
|---|---|---|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | BRD |
| Create / share request | ✓ | — | — | ✓ | — | BRD |
| Accept / reject incoming request | — | ✓ | — | ✓ | — | BRD |
| Cancel trip (with reason) | ✓ | ✓ | — | ✓ | — | BRD |
| Comment on trip | ✓ | ✓ | ✓ | ✓ | — | BRD |
| Approve / decline invoice | — | — | ✓ | ✓ | — | BRD |
| Export lists | ✓ | ✓ | ✓ | ✓ | ✓ | BRD |
| Mark complete | — | ✓ | — | ✓ | — | WA-05 (PQ-05) |
| Create / edit / submit invoice | — | — | ✓ | ✓ | — | WA-04 (PQ-04) |
| Set alternative start address | — | ✓ | — | ✓ | — | WA-19 (PQ-19) |
| Propose / confirm price change | ✓ propose | ✓ confirm | — | ✓ | — | WA-21 (PQ-21) |
| Configure BusNetwork defaults | — | — | — | ✓ | — | BRD §5 Admin |

**Design tension to respect.** The Partner Coordinator also runs the company's own-fleet work. Incoming requests must be impossible to miss — dashboard figure, "Needs your action", nav badge, push/email (BRD §11) — and must show the deadline.

---

## 3. Stakeholders

Derived from BRD §5 (roles), §15 (question owners), §16 (sign-off), §13 (integrations) and §14 (risks and migration). No stakeholder is invented; each row cites where the BRD places them.

| ID | Stakeholder | Role / responsibility | Interest in the product | Key expectations | Interaction with the product |
|---|---|---|---|---|---|
| SH-01 | **Product Owner** (BRD §16 sign-off; owner of Q1, Q7) | Owns scope, priorities and the BRD/PRD; decides PQ-01, PQ-02, PQ-03, PQ-16, PQ-17, PQ-18, PQ-20 | The portal delivers OBJ-1…OBJ-5 without scope creep | BRD honoured exactly; assumptions surfaced, not buried; release slices respected | Reviews and signs the PRD; answers open questions; watches M-1…M-5 |
| SH-02 | **Head of Sales / Operations** (BRD §16; owner of Q3, Q4, Q5, Q6) | Owns how trips are shared, answered and completed in practice | Faster hand-off (OBJ-1) and fewer unanswered requests (OBJ-2) | Sales and coordinator workflows match how crews actually work; lifecycle decisions (Q3–Q6) land before build | Decides Q3–Q6, PQ-05, PQ-06, PQ-08, PQ-09, PQ-19, PQ-21; pilot sponsor |
| SH-03 | **Finance Lead** (BRD §16; owner of Q1, Q2) | Owns settlement, VAT treatment and the claim → invoice transition | Faster settlement (OBJ-3); no amount changes after a decision | Invoice statuses match Claim Settlement; amounts lock at approval; migration totals reconcile | Decides Q1, Q2, PQ-04, PQ-11, PQ-13, PQ-16; signs off the trial migration (SUC-6) |
| SH-04 | **Engineering Lead** (BRD §16) | Owns the SPEC, Architecture Spine and delivery | Requirements that are unambiguous and testable; dependencies named | One status one writer (AR-01); no requirement without an acceptance criterion; platform preconditions (AR-00) supplied | Builds from §6, §7 and the SPEC; raises defects against this PRD |
| SH-05 | **QA Lead** (BRD §16) | Owns test strategy and release gates | Every requirement provable | Given/When/Then criteria (§10), edge-case behaviour (§12), screen states (§14) | Turns §10 and §12 into the test suite; owns the reconciliation and concurrency tests |
| SH-06 | **Data Protection Officer** (BRD NFR-05; PQ-15 owner) | Owns GDPR compliance for cross-company personal data | Only data needed to run the trip reaches a partner | WA-08 field list signed off before R1; notifications carry no extra personal data | Approves PQ-15; reviews FR-103 and Appendix C |
| SH-07 | **Host companies (operators sharing trips)** | Business users of the host side | Get trips covered at a price that works | Partner answers fast; the price they set is the price invoiced; their customer data stays theirs | Daily use of MOD-02…MOD-07 through P-SALES, P-FIN, P-ADMIN |
| SH-08 | **Partner companies (operators receiving trips)** | Business users of the partner side | Win work that fits their fleet | Requests arrive immediately with a deadline; they are paid for what they ran | Daily use through P-PCOORD, P-FIN, P-ADMIN |
| SH-09 | **End customers of the host** (BRD §6 glossary; BR-04) | Indirect — the booking behind the trip | Their trip runs; their data is not spread around | Personal data limited to what the partner needs (NFR-05) | None directly; represented by the host |
| SH-10 | **TEQ Platform teams** — Sales/Planning, Company Settings, BusNetwork Settings, Scheduler, login (BRD §13) | Own the systems BusNetwork reads and writes | No regression in their areas; clean integration contracts | Legacy Sales › Network screens keep working until the portal replaces them (BRD §14 constraint); scheduler jobs monitored | Provide APIs and jobs; consume the portal's back-links and status changes |
| SH-11 | **Bus Network service team** (BRD §13; dependency D-1) | Owns the store for shared trips, share requests, statuses and invoice data | A data model that supports six statuses and per-partner requests | Filter and count by the six statuses (BRD §14 assumption) | Supplies the data model and APIs; partner in the migration |
| SH-12 | **Migration team** (BRD §14 risk; PRD Appendix G) | Maps legacy active/archive trips and claims onto the new model | No data lost in the move | Trial run on production copy; exception report instead of guesses | Runs Appendix G; hands Finance the reconciliation |
| SH-13 | **Support team** (OBJ-5 / M-5) | First line for "where is my trip" tickets | Fewer status and missing-trip tickets | Tags in place ≥ 3 months before launch (dependency D-4) | Supplies the M-5 baseline and ongoing measurement |
| SH-14 | **UX team** (UX package) | Owns DESIGN, EXPERIENCE, SCREENS and the prototype | Screens that cover every workflow and state | Screen inventory (§14) stays in step with the PRD; WCAG 2.1 AA floor | Builds from §9, §12, §14; feeds changes back as PRD defects |
| SH-15 | **Security / compliance (ISO 27001 baseline)** (NFR-03) | Owns the corporate security baseline | No authorization gap between companies | Every API call checks company, role, department and side; attachments scanned | Reviews NFR-008…NFR-011 evidence before GA |

---

## 4. Product modules

Ten modules. MOD-01…MOD-08 are the product surface (the six tabs plus the trip detail page and notifications); MOD-09 and MOD-10 are cross-cutting and have no tab of their own. Architecture components (`C-nn`) are from the Architecture Spine.

### MOD-01 — Portal shell and navigation

| | |
|---|---|
| **Purpose** | Give the whole exchange one entry point with a fixed navigation bar, so no network task needs a legacy screen (PG-1, OBJ-4). |
| **Main functionality** | Six-tab bar in fixed order; tabs hidden when the user can't open them; Active Trips and Invoice List badges; deep-linkable routes with URL state; TEQ top bar with the notification bell. |
| **Primary personas** | All five. |
| **Related business requirements** | BRD §7 (navigation), BN-LST-06, BN-LST-10, BN-DSH-02, BN-INV-08. |
| **Dependencies** | MOD-09 (what the user may open), MOD-04 (badge counts), MOD-07 (invoice badge), TEQ login. |
| **Major features** | FEAT-01 Six-tab navigation · FEAT-02 Action badges · FEAT-03 Deep-linkable routes and URL state. |
| **Screens** | S-00. **Arch:** C-01. |

### MOD-02 — Dashboard

| | |
|---|---|
| **Purpose** | Answer, in order: what needs my action now, what is running soon, how is the network doing (BRD §9.1) — the fix for PB-2. |
| **Main functionality** | Five key figures, each a deep link; upcoming trips; "Needs your action"; period selector; trip-volume and top-partner charts; freshness indicator. |
| **Primary personas** | All five (content differs by role; P-VIEW sees *Recent activity* instead of *Needs your action*). |
| **Related business requirements** | BN-DSH-01…BN-DSH-08, BN-INV-08. |
| **Dependencies** | MOD-04 (list queries and deep-link targets), MOD-06 (statuses), MOD-07 (invoice amounts), MOD-09 (scope). |
| **Major features** | FEAT-04 Key figures and deep links · FEAT-05 Upcoming trips · FEAT-06 Needs your action · FEAT-07 Period selector and network charts · FEAT-08 Data freshness. |
| **Screens** | S-01. **Arch:** C-11. |

### MOD-03 — Request and share

| | |
|---|---|
| **Purpose** | Turn a trip the host cannot run into a request that one or more partners can answer, at a price taken from each agreement (OBJ-1). |
| **Main functionality** | Four-step form (trip details → partners → price → review); prefill from an existing TEQ trip; drafts; partner picker limited to accepted affiliations; per-partner offer price with override and additional costs; response deadline; submit; edit while Requested; quick share. |
| **Primary personas** | P-SALES, P-ADMIN. |
| **Related business requirements** | BN-REQ-01…BN-REQ-10, BR-02, BR-08, BN-ACT-04 (*Edit*). |
| **Dependencies** | BusNetwork Settings (affiliations, agreements, default partner), TEQ Sales/Planning (customers, vehicle types, source trip, back-link), Google Maps, S3, MOD-06 (creates the trip), MOD-08 (N-01). |
| **Major features** | FEAT-09 Four-step request form · FEAT-10 Prefill and entry points · FEAT-11 Drafts · FEAT-12 Partner selection · FEAT-13 Offer pricing · FEAT-14 Response deadline · FEAT-15 Submission and share requests · FEAT-16 Edit a requested trip · FEAT-17 Quick share. |
| **Screens** | S-02 (S-02.1…S-02.6). **Arch:** C-04, C-05, C-13. |

### MOD-04 — Trip lists (Active, Closed, All)

| | |
|---|---|
| **Purpose** | Make every trip findable in exactly one open list, one closed list and one complete list that reconcile (PG-3, OBJ-5). |
| **Main functionality** | One shared list component — paging, search, date range, company filter, sort, URL state, formats, empty states, export, open-and-return — plus the three lists' own filters, columns and defaults. |
| **Primary personas** | All five. |
| **Related business requirements** | BN-LST-01…10, BN-ACT-01…03, BN-ACT-08, BN-CLS-01…03, BN-CLS-05, BN-CLS-07, BN-ALL-01…03, BN-ALL-05, BN-ALL-06, BRD §8 columns. |
| **Dependencies** | MOD-06 (company-view status), MOD-09 (scope and field visibility), MOD-07 (invoice column), MOD-05 (row → detail). |
| **Major features** | FEAT-18 Shared list component · FEAT-19 List export · FEAT-20 Active Trips list · FEAT-21 Closed Trips list · FEAT-22 All Trips list. |
| **Screens** | S-03, S-04, S-05, S-11, S-13. **Arch:** C-02, C-12. |

### MOD-05 — Trip detail and collaboration

| | |
|---|---|
| **Purpose** | One page that shows a trip completely to each side, carries the conversation between the two companies, and records what happened (PB-1, PB-3). |
| **Main functionality** | Header with status and actions; route and map; schedule; PAX and vehicle; shifts; pricing; customer and references; attachments; partner responses; comment thread; history log; consistency flag; alternative start address; post-acceptance price change. |
| **Primary personas** | P-SALES, P-PCOORD, P-FIN, P-ADMIN (read), P-VIEW (read). |
| **Related business requirements** | BN-DTL-01…BN-DTL-06, BR-04, BR-05, BN-CLS-03, BN-CLS-06. |
| **Dependencies** | MOD-06 (actions and status), MOD-09 (field visibility), MOD-08 (N-06), Google Maps, S3, MOD-10 (consistency check, audit). |
| **Major features** | FEAT-23 Trip detail page · FEAT-24 Comment threads · FEAT-25 History log · FEAT-26 Consistency flag · FEAT-27 Post-acceptance price change. |
| **Screens** | S-06, S-12. **Arch:** C-01, C-06, C-07, C-15. |

### MOD-06 — Trip lifecycle and actions

| | |
|---|---|
| **Purpose** | Own the one rule the product rests on: a trip has exactly one status, changed only by defined transitions, and that status decides where it is listed (BR-01). |
| **Main functionality** | State machine T1…T7 with guards and side effects; one action matrix driving lists and detail; accept with first-accept-wins; reject and cancel with mandatory reasons; mark complete; scheduler-driven In progress, Completed and expiry; closed immutability; per-company view status; bulk response. |
| **Primary personas** | P-SALES, P-PCOORD, P-ADMIN (System for scheduler transitions). |
| **Related business requirements** | BRD §7, BN-ACT-04…BN-ACT-07, BN-ACT-09, BN-DTL-06, BN-CLS-06, BN-ALL-04, BR-01, BR-03, BR-05, BN-REQ-08. |
| **Dependencies** | MOD-03 (creates trips), MOD-08 (notifications after commit), MOD-10 (scheduler, audit), MOD-09 (role and side checks). |
| **Major features** | FEAT-28 Action matrix · FEAT-29 Accept and first-accept-wins · FEAT-30 Reject and cancel with reason · FEAT-31 Completion · FEAT-32 Expiry · FEAT-33 Closed immutability · FEAT-34 Bulk response · FEAT-35 Company-view status. |
| **Screens** | S-03, S-06, S-09. **Arch:** C-03, C-10. |

### MOD-07 — Invoicing and settlement

| | |
|---|---|
| **Purpose** | Settle a Completed trip where the trip already is, so what is owed is never separate from the work (PB-4, OBJ-3). |
| **Main functionality** | Create an invoice from a Completed trip; prefill from the agreed offer price, additional costs and VAT settings; extra lines; submit, approve, decline with reason; new version after a decline; Incoming/Outgoing/Archive sub-tabs with filters and totals; amount locking; PDF. |
| **Primary personas** | P-FIN, P-ADMIN (P-SALES and P-PCOORD see the invoice status on the trip). |
| **Related business requirements** | BN-CLS-04, BN-CLS-05, BN-INV-01…BN-INV-10, BR-06, BR-08. |
| **Dependencies** | MOD-06 (Completed status), TEQ Company Settings (VAT, currency, company details), MOD-04 (list behaviour), MOD-08 (N-07, N-08), S3 (PDF). |
| **Major features** | FEAT-36 Invoice creation and prefill · FEAT-37 Invoice lines and totals · FEAT-38 Submit, approve, decline · FEAT-39 Versioning after decline · FEAT-40 Invoice List and archive · FEAT-41 Amount locking · FEAT-42 Invoice PDF. |
| **Screens** | S-07, S-08, S-09. **Arch:** C-08. |

### MOD-08 — Notifications

| | |
|---|---|
| **Purpose** | Put every lifecycle event in front of the person who must act, in their company's language, without blocking the action that caused it (BRD §11). |
| **Main functionality** | Eight events N-01…N-08; in-app panel plus email, with push and SMS where the company enables them; deep links; per-user channel settings and optional daily summary; retries and failure logging. |
| **Primary personas** | All five (recipients differ per event). |
| **Related business requirements** | BRD §11, BRD §14 (notification-fatigue mitigation), NFR-06. |
| **Dependencies** | MOD-06 and MOD-07 (events), MOD-09 (who may receive what), TEQ channels (email, push, SMS). |
| **Major features** | FEAT-43 Lifecycle notifications · FEAT-44 Notification preferences. |
| **Screens** | S-10. **Arch:** C-09. |

### MOD-09 — Access, permissions and visibility

| | |
|---|---|
| **Purpose** | Make sure each company sees only its own trips and invoices, each user only their departments, and each partner only what it needs to run the trip (BR-04, BR-09, NFR-03, NFR-05). |
| **Main functionality** | TEQ sign-in and session; role → action checks; company and department scope in the query layer; side checks; server-side field filtering per viewing company; "not found" for out-of-scope objects. |
| **Primary personas** | All five (enforced for every persona); configured by P-ADMIN. |
| **Related business requirements** | BRD §5 permission matrix, BR-04, BR-09, NFR-03, NFR-05. |
| **Dependencies** | TEQ login and permission system; BusNetwork Settings (departments per affiliation). |
| **Major features** | FEAT-45 Authentication and session · FEAT-46 Role and scope enforcement · FEAT-47 Cross-company field visibility. |
| **Screens** | S-12 (rules), applies to all. **Arch:** C-15. |

### MOD-10 — Platform services (audit, jobs, integrations, analytics, migration)

| | |
|---|---|
| **Purpose** | Carry the obligations that sit under every feature: an audit trail, timely scheduled jobs, honest behaviour when an integration is down, measurement, and a lossless move off the legacy screens. |
| **Main functionality** | Append-only history and audit with 5-year retention; scheduler jobs (start, complete, expire, 2-hour warning, nightly consistency check) with timeliness monitoring; integration adapters and failure behaviour; analytics events TM-01…TM-13; migration mapping and exception reporting. |
| **Primary personas** | System; results visible to all personas (history, flags) and to SH-12/SH-13. |
| **Related business requirements** | NFR-03, NFR-04, BRD §13, BRD §14 (assumptions and risks), OBJ-1…OBJ-5. |
| **Dependencies** | TEQ Scheduler, Bus Network service, all integrations in BRD §13. |
| **Major features** | FEAT-48 Audit trail · FEAT-49 Scheduled jobs · FEAT-50 Nightly consistency check · FEAT-51 Integration resilience · FEAT-52 Analytics instrumentation · FEAT-53 Migration tooling. |
| **Screens** | Surfaces inside S-06 (history, flag) and S-13. **Arch:** C-07, C-10, C-13, C-14, C-16. |

### 4.1 Module dependency map

```
            MOD-09 Access, permissions & visibility  ── enforced by every module ──┐
            MOD-10 Platform services (audit · jobs · integrations · analytics)  ───┤
                                                                                   │
MOD-01 Shell ─┬─ MOD-02 Dashboard ──────► reads MOD-04, MOD-06, MOD-07             │
              ├─ MOD-03 Request ────────► creates trips in MOD-06                  │
              ├─ MOD-04 Trip lists ─────► reads MOD-06 status, MOD-07 invoice ◄────┤
              ├─ MOD-05 Trip detail ────► reads MOD-06, writes comments            │
              ├─ MOD-06 Lifecycle ──────► emits events to MOD-08                   │
              └─ MOD-07 Invoicing ──────► requires MOD-06 status Completed ────────┘
                         MOD-08 Notifications ◄── events from MOD-06, MOD-07, MOD-03
```

---

## 5. Feature identification

### 5.1 How features were identified

Every feature below is derived from a BRD requirement, rule or explicitly stated behaviour. Features are grouped by module; the chain **Business requirement → Module → Feature → User story → Acceptance criterion** is completed in §16.

No feature is introduced that the BRD does not support. Three items are behaviour the BRD makes necessary without naming (marked *derived*, each citing its source), and none of them adds user-visible scope:

| Feature | Why it exists without a BN-* ID of its own | Source |
|---|---|---|
| FEAT-26 Consistency flag | BRD §14 risk "Trip data differs between the TEQ trip and the network copy" names the mitigation: nightly check and a flag on the detail page | BRD §14 |
| FEAT-35 Company-view status | BR-01 (one status) must stay true when one request goes to several partners who answer separately (BN-REQ-04, BN-ACT-05/07) | WA-01 / **PQ-01** |
| FEAT-53 Migration tooling | BRD §14 assumption "existing trips and claims can be matched … without losing any data" and the §14 migration risk | BRD §14 |

There are **no proposed enhancements** in this PRD. One *sequencing recommendation* is carried, not a scope change: pull BN-REQ-08 (response deadline, *Should*) into R1, because OBJ-2, the "expiring in 2 h" notification and the only exit from an unanswered Requested trip depend on it (§15.4, PQ-10).

### 5.2 Feature map by module

| Module | Features | BRD requirements covered |
|---|---|---|
| MOD-01 | FEAT-01, FEAT-02, FEAT-03 | BRD §7, BN-INV-08, BN-LST-06, BN-LST-10, BN-DSH-02 |
| MOD-02 | FEAT-04 … FEAT-08 | BN-DSH-01…08 |
| MOD-03 | FEAT-09 … FEAT-17 | BN-REQ-01…10, BR-02, BR-08, BN-ACT-04 (Edit) |
| MOD-04 | FEAT-18 … FEAT-22 | BN-LST-01…10, BN-ACT-01…03, 08, BN-CLS-01…03, 05, 07, BN-ALL-01…03, 05, 06 |
| MOD-05 | FEAT-23 … FEAT-27 | BN-DTL-01…06, BR-05, BN-CLS-03/06 |
| MOD-06 | FEAT-28 … FEAT-35 | BRD §7, BN-ACT-04…07, 09, BN-ALL-04, BN-DTL-06, BN-CLS-06, BR-01, BR-03 |
| MOD-07 | FEAT-36 … FEAT-42 | BN-CLS-04/05, BN-INV-01…10, BR-06 |
| MOD-08 | FEAT-43, FEAT-44 | BRD §11, BRD §14 mitigation |
| MOD-09 | FEAT-45, FEAT-46, FEAT-47 | BRD §5, BR-04, BR-09, NFR-03, NFR-05 |
| MOD-10 | FEAT-48 … FEAT-53 | NFR-03, NFR-04, BRD §13, BRD §14, OBJ-1…5 |

### 5.3 Traceability skeleton — business requirement → feature

The full matrix, with FR, epic, story, acceptance criteria, screen and priority, is §16. This table fixes the first two links for all 66 BRD functional requirements.

| BRD requirement | Module | Feature |
|---|---|---|
| BN-LST-01…05, 07, 08 | MOD-04 | FEAT-18 |
| BN-LST-06 | MOD-01, MOD-04 | FEAT-03, FEAT-18 |
| BN-LST-09 | MOD-04 | FEAT-19 |
| BN-LST-10 | MOD-04, MOD-05 | FEAT-18, FEAT-23 |
| BN-DSH-01, 02 | MOD-02 | FEAT-04 |
| BN-DSH-03 | MOD-02 | FEAT-05 |
| BN-DSH-04 | MOD-02 | FEAT-06 |
| BN-DSH-05, 06, 07 | MOD-02 | FEAT-07 |
| BN-DSH-08 | MOD-02 | FEAT-08 |
| BN-REQ-01, 10 | MOD-03 | FEAT-09 |
| BN-REQ-02 | MOD-03 | FEAT-11 |
| BN-REQ-03, 04 | MOD-03 | FEAT-12 |
| BN-REQ-05, 06 | MOD-03 | FEAT-13 |
| BN-REQ-07 | MOD-03 | FEAT-17 |
| BN-REQ-08 | MOD-03, MOD-06 | FEAT-14, FEAT-32 |
| BN-REQ-09 | MOD-03 | FEAT-10, FEAT-15 |
| BN-ACT-01, 02, 03, 08 | MOD-04 | FEAT-20 |
| BN-ACT-04 | MOD-06, MOD-03 | FEAT-28, FEAT-16 |
| BN-ACT-05 | MOD-06 | FEAT-30 |
| BN-ACT-06, 07 | MOD-06 | FEAT-29 |
| BN-ACT-09 | MOD-06 | FEAT-34 |
| BN-DTL-01, 02, 03 | MOD-05 | FEAT-23 |
| BN-DTL-04 | MOD-05 | FEAT-24 |
| BN-DTL-05 | MOD-05, MOD-10 | FEAT-25, FEAT-48 |
| BN-DTL-06 | MOD-06 | FEAT-28 |
| BN-CLS-01, 02, 03, 05, 07 | MOD-04 | FEAT-21 |
| BN-CLS-04 | MOD-07 | FEAT-36 |
| BN-CLS-06 | MOD-06 | FEAT-33 |
| BN-ALL-01, 02, 03, 05 | MOD-04 | FEAT-22 |
| BN-ALL-04 | MOD-06 | FEAT-28 |
| BN-ALL-06 | MOD-04 | FEAT-19 |
| BN-INV-01, 02, 10 | MOD-07 | FEAT-40 |
| BN-INV-03, 04 | MOD-07 | FEAT-36 |
| BN-INV-05 | MOD-07 | FEAT-37 |
| BN-INV-06 | MOD-07 | FEAT-38 |
| BN-INV-07 | MOD-07 | FEAT-41 |
| BN-INV-08 | MOD-01, MOD-02 | FEAT-02, FEAT-04 |
| BN-INV-09 | MOD-07 | FEAT-42 |
| BR-01 | MOD-06 | FEAT-35, FEAT-22 |
| BR-02 | MOD-03 | FEAT-12 |
| BR-03 | MOD-06 | FEAT-29 |
| BR-04, BR-09 | MOD-09 | FEAT-46, FEAT-47 |
| BR-05 | MOD-05 | FEAT-27 |
| BR-06 | MOD-07 | FEAT-36 |
| BR-07, BR-08 | MOD-04, MOD-03, MOD-07 | FEAT-18, FEAT-13, FEAT-37 |
| BRD §11 | MOD-08 | FEAT-43, FEAT-44 |
| BRD §13 | MOD-10 | FEAT-51 |
| BRD §14 (risk, assumptions) | MOD-10 | FEAT-50, FEAT-53 |

---

## 6. Functional requirements

Each requirement states what the system must do, who may do it, what must be true first, how it behaves, what goes in and out, what is validated, which permission governs it, what it depends on and which business rule constrains it. The header line of each block gives: *implements* (BRD ID or derived source) · module · feature · priority and release slice.

Priorities are the BRD's own MoSCoW values. A requirement derived from a BRD requirement inherits that requirement's priority; a requirement derived from a rule, risk or NFR is marked with its source and is **Must** unless stated.

### 6.1 MOD-01 — Portal shell and navigation

#### FR-001 — Fixed-order six-tab navigation bar
*Implements* BRD §7 · MOD-01 · FEAT-01 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Present one top-level navigation bar in the fixed order Dashboard · Request · Active Trips · Closed Trips · All Trips · Invoice List, on every portal screen. |
| Actor | All personas (view). |
| Preconditions | User is signed in through TEQ login and their company has a linked Bus Network account (BRD §14 assumption A-1). |
| Main behaviour | The bar renders in the fixed order; the current tab is marked (`aria-current="page"`); selecting a tab navigates to its route (Appendix A). The order never varies by role — only which tabs are present. |
| Inputs | User session (company, role, departments). |
| Outputs | Rendered navigation bar; active-tab indication. |
| Validation | — |
| Permissions | Visibility per FR-002; no action rights needed to see the bar. |
| Dependencies | MOD-09 (session, role), TEQ shell. |
| Related business rule | BR-09 (scope applies to everything reachable from the bar). |

#### FR-002 — Tab visibility follows permissions; unavailable tabs are hidden
*Implements* BRD §7 ("Tabs a user can't open are hidden, not shown as disabled") · MOD-01 · FEAT-01 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Hide a tab the signed-in user may not open, rather than showing it disabled. |
| Actor | System, per user. |
| Preconditions | Role and permissions resolved for the session. |
| Main behaviour | Request is shown only to holders of *Create / share request*; Invoice List only to holders of *Approve / decline invoice* or invoice-creation rights (WA-04); Dashboard and the three trip lists are shown to every role with any trip-view right (**WA-02**, *blocking* **PQ-02**). Navigating directly to a hidden tab's route returns the standard refusal (FR-104). |
| Inputs | Role, permission set. |
| Outputs | Reduced navigation bar. |
| Validation | Server re-checks on every request; hiding in the UI is never the only control (DR-02). |
| Permissions | BRD §5 permission matrix, extended in FR-101. |
| Dependencies | MOD-09. |
| Related business rule | BR-09. |

#### FR-003 — Active Trips badge
*Implements* BRD §7 (badge "Open trips") · MOD-01 · FEAT-02 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show, on the Active Trips tab, the count of trips in the user's scope whose company-view status is Requested, Accepted or In progress — identical to the unfiltered Active Trips total. |
| Actor | System. |
| Preconditions | Active Trips tab visible to the user. |
| Main behaviour | The badge is computed from the same query model as the list (FR-047), so badge and list can never disagree; it refreshes with the same freshness rule as the dashboard (FR-014). Zero is shown as no badge. |
| Inputs | User scope (company, departments), trip statuses. |
| Outputs | Integer badge. |
| Validation | — |
| Permissions | Counts only what the user could open (BR-09). |
| Dependencies | MOD-04 (C-02 query builder), MOD-06 (status). |
| Related business rule | BR-01, BR-09. |

#### FR-004 — Invoice List badge
*Implements* BN-INV-08 · MOD-01 · FEAT-02 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show, on the Invoice List tab, the number of **incoming** invoices with status Pending in the user's scope. |
| Actor | System. |
| Preconditions | Invoice List tab visible (Finance, Admin). |
| Main behaviour | The badge equals the Dashboard *Open invoices* count (FR-007) by construction. It decreases when an invoice is approved or declined. |
| Inputs | Invoice statuses and direction, user scope. |
| Outputs | Integer badge. |
| Validation | — |
| Permissions | Finance, Admin. |
| Dependencies | MOD-07. |
| Related business rule | BR-04, BR-09. |

#### FR-005 — Deep-linkable routes
*Implements* BN-DSH-02, BN-LST-10 (return target) · MOD-01 · FEAT-03 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Give every screen a stable route, and every list a route that carries its filters, sort and page (Appendix A route table). |
| Actor | All personas. |
| Preconditions | — |
| Main behaviour | Routes: `/busnetwork` (Dashboard), `/busnetwork/request`, `/busnetwork/trips/active|closed|all`, `/busnetwork/trips/<tripId>`, `/busnetwork/invoices/incoming|outgoing|archive`, `/busnetwork/invoices/<invoiceNo>`. Dashboard figures deep-link to pre-filtered lists (FR-008). Dates in URLs are `YYYY-MM-DD` in the user's time zone and are converted to UTC ranges server-side. |
| Inputs | URL and its parameters. |
| Outputs | The screen in the requested state. |
| Validation | A parameter the user may not use (e.g. a company outside their scope) is dropped and the list shows "Some filters were removed" (ES-14). |
| Permissions | The route is still subject to FR-101 to FR-104. |
| Dependencies | MOD-04, MOD-02, MOD-07. |
| Related business rule | BR-07 (time-zone conversion), BR-09. |

#### FR-006 — Notification bell in the shell
*Implements* BRD §11 (in-app channel) · MOD-01 · FEAT-01, FEAT-43 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show a notification bell with an unread count in the TEQ top bar, opening the notifications panel (S-10). |
| Actor | All personas. |
| Preconditions | Signed in. |
| Main behaviour | The panel lists the user's in-app notifications (Unread / All), each with text, relative time and a deep link to the trip or invoice; "Mark all read"; a link to notification settings (FR-098). |
| Inputs | Notification records for the user. |
| Outputs | Panel contents; unread count. |
| Validation | — |
| Permissions | A user only receives notifications about objects in their scope (FR-102). |
| Dependencies | MOD-08. |
| Related business rule | BR-04, BR-09. |

### 6.2 MOD-02 — Dashboard

#### FR-007 — Five key figures
*Implements* BN-DSH-01 · MOD-02 · FEAT-04 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show, for the user's company and departments: **Awaiting response**, **Active trips**, **Starting next 7 days**, **Closed this month**, **Open invoices**. |
| Actor | All personas (view). |
| Preconditions | Dashboard opened. |
| Main behaviour | Definitions: *Awaiting response* = trips with company-view status Requested that the company **received** ("requests waiting on us", **WA-03**, PQ-03). *Active trips* = Accepted + In progress (as labelled in the BRD wireframe; deliberately narrower than the Active Trips badge, and the tile states its definition). *Starting next 7 days* = Accepted or In progress with planned start from now to end of day 7. *Closed this month* = trips that reached Completed in the selected period (FR-011). *Open invoices* = total incl. VAT of incoming Pending invoices, with count; second line shows outgoing Pending total (**WA-13**, PQ-16). |
| Inputs | Trip statuses, planned starts, invoice statuses and amounts; selected period; user scope. |
| Outputs | Five tiles with value, label and sub-line; each is a link (FR-008). |
| Validation | Zero renders as "0", never as an empty tile. |
| Permissions | All roles; values limited to the user's scope. |
| Dependencies | MOD-04, MOD-06, MOD-07, MOD-09. |
| Related business rule | BR-01, BR-04, BR-09. |

#### FR-008 — Key figures open the matching filtered list
*Implements* BN-DSH-02 · MOD-02 · FEAT-04 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Open, on selecting a key figure, the list that produced it with those filters already applied and visible. |
| Actor | All personas. |
| Preconditions | Figure rendered. |
| Main behaviour | Awaiting response → `/trips/active?status=REQUESTED&direction=received`; Active trips → `/trips/active?status=ACCEPTED,IN_PROGRESS`; Starting next 7 days → the same plus `from`/`to`; Closed this month → `/trips/closed?status=COMPLETED&closedFrom=…&closedTo=…`; Open invoices → `/invoices/incoming?status=PENDING`. Filters appear as chips in the UI and as parameters in the URL. |
| Inputs | Selected figure; current period. |
| Outputs | Navigation to a pre-filtered list. |
| Validation | The count on the list must match the tile for the same moment (subject to FR-014 freshness). |
| Permissions | If the target list is hidden for the role, the figure is not a link. |
| Dependencies | FR-005, MOD-04, MOD-07. |
| Related business rule | BR-01, BR-09. |

#### FR-009 — Upcoming trips widget
*Implements* BN-DSH-03 · MOD-02 · FEAT-05 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List the next 10 trips with status Accepted or In progress, sorted by planned start ascending, each linking to its detail page. |
| Actor | All personas (view). |
| Preconditions | — |
| Main behaviour | Columns: Trip ID, start, route, PAX, company, status. "View all" opens Active Trips sorted by start. Fewer than 10 rows renders as many as exist; none renders "No upcoming trips". |
| Inputs | Trips in scope with those statuses. |
| Outputs | Table of up to 10 rows with links. |
| Validation | — |
| Permissions | Scope-limited (BR-09); counterpart company name per BR-04. |
| Dependencies | MOD-04, MOD-05. |
| Related business rule | BR-04, BR-09. |

#### FR-010 — "Needs your action" widget
*Implements* BN-DSH-04 · MOD-02 · FEAT-06 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List the items waiting on the signed-in user's role: incoming requests, cancellations by the other company, invoices to approve, and unread comments. |
| Actor | P-SALES, P-PCOORD, P-FIN, P-ADMIN. |
| Preconditions | The user holds the role that can act on the item. |
| Main behaviour | Grouped by kind with counts, newest first, at most 20 items; each item links to the trip or invoice; a group header opens the filtered list. Items clear when: the request is accepted, rejected, withdrawn or expires; the user opens the cancelled trip (**WA-15**); the invoice is approved or declined; the comment thread is viewed. A request item shows its response deadline. |
| Inputs | Trips, invoices, comments and their read state in the user's scope. |
| Outputs | Grouped action list with deep links. |
| Validation | An item never appears for a user who cannot act on it. |
| Permissions | Per role, per FR-101; P-VIEW sees *Recent activity* instead (FR-015). |
| Dependencies | MOD-06, MOD-07, MOD-05 (comment read state, DR-13). |
| Related business rule | BR-04, BR-09. |

#### FR-011 — Period selector
*Implements* BN-DSH-05 · MOD-02 · FEAT-07 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Let the user choose This week (ISO week, Monday start), This month, Last 30 days or Custom, and recalculate the period-based figure and the charts. |
| Actor | All personas. |
| Preconditions | Dashboard open. |
| Main behaviour | Changing the period relabels the *Closed this month* tile to the chosen period and recalculates it and the charts; the non-period figures are unchanged. The selection is kept in the URL (`period`, `from`, `to`). |
| Inputs | Period choice; custom From/To. |
| Outputs | Recalculated figures and charts; updated URL. |
| Validation | Custom range follows BN-LST-03 day-boundary rules; From after To is refused inline. |
| Permissions | All roles. |
| Dependencies | FR-005, FR-007, FR-012, FR-013. |
| Related business rule | BR-07. |

#### FR-012 — Trip volume chart
*Implements* BN-DSH-06 · MOD-02 · FEAT-07 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Show weekly trip volume, shared versus received, for the last 12 ISO weeks. |
| Actor | All personas (view). |
| Preconditions | — |
| Main behaviour | Grouped bars per week with a labelled legend and a "View as table" alternative for accessibility. Trips are counted by **request submission week** (**WA-14**, PQ-14). |
| Inputs | Share requests and trips in scope with submission dates. |
| Outputs | Chart plus equivalent table. |
| Validation | — |
| Permissions | All roles. |
| Dependencies | FR-011, MOD-10 (aggregates). |
| Related business rule | BR-09; NFR-07 (not colour alone). |

#### FR-013 — Top partners widget
*Implements* BN-DSH-07 · MOD-02 · FEAT-07 · **Could (Later)**

| Aspect | Detail |
|---|---|
| System must | Show the top 5 counterpart companies by trips Completed in the selected period, in descending order. |
| Actor | All personas (view). |
| Preconditions | Period selected (FR-011). |
| Main behaviour | Ranked list with completed-trip count and a bar. Whether the counterpart's name is shown or hidden for commercially sensitive partners is **Q7**; until it is answered, names are shown. |
| Inputs | Completed trips in the period, counterpart company. |
| Outputs | Ranked list. |
| Validation | — |
| Permissions | All roles. |
| Dependencies | FR-011. |
| Related business rule | BR-04 (only counterpart companies of this company), BR-09; **Q7**. |

#### FR-014 — Dashboard freshness
*Implements* BN-DSH-08 · MOD-02 · FEAT-08 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Serve dashboard data no more than 5 minutes old and show when it was last updated. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | The header shows "Updated HH:MM" with a Refresh control; while the page is open the stamp is never older than 5 minutes. A change made by the user themselves is reflected immediately in the affected figure. |
| Inputs | Aggregate cache timestamps. |
| Outputs | Figures, widgets, "Updated HH:MM". |
| Validation | — |
| Permissions | All roles. |
| Dependencies | MOD-10 (aggregate job), NFR-006. |
| Related business rule | BR-07 (time shown in the user's zone). |

#### FR-015 — Viewer variant of the action widget
*Implements* BN-DSH-04 applied to a read-only role (BRD §5 Viewer: no actions) · MOD-02 · FEAT-06 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Replace "Needs your action" with "Recent activity" — the latest status changes in the user's scope — for roles with no action rights. |
| Actor | P-VIEW. |
| Preconditions | Role has no actionable permissions. |
| Main behaviour | The widget lists recent status changes (trip, from → to, when, company) with links to the detail page; no action buttons anywhere on the dashboard. |
| Inputs | History entries in scope. |
| Outputs | Activity list. |
| Validation | — |
| Permissions | P-VIEW (and any role whose action set is empty). |
| Dependencies | FR-105 (history), FR-101. |
| Related business rule | BR-04, BR-09. |

#### FR-016 — Dashboard states
*Implements* BN-DSH-01…08 with BN-LST-08 state discipline · MOD-02 · FEAT-08 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Render a defined state for every widget: loading skeleton, zero values, empty widget text, and a per-widget error with Retry that does not stop the rest of the page rendering. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | Tiles show "0" rather than blank; empty widgets read "Nothing waiting on you" / "No upcoming trips"; a failed widget shows its own error and Retry (ES-27). |
| Inputs | Query results or failures per widget. |
| Outputs | Widget in the appropriate state. |
| Validation | — |
| Permissions | — |
| Dependencies | MOD-10 (integration failures). |
| Related business rule | — |

### 6.3 MOD-03 — Request and share

#### FR-017 — Four-step request form with per-step validation
*Implements* BN-REQ-01 · MOD-03 · FEAT-09 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let a host user create a normal or fixed trip through four steps — 1 Trip details, 2 Select partners, 3 Set price, 4 Review & submit — where a step can only be completed when its required fields are valid. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | User holds *Create / share request*; the company has at least one accepted affiliation (otherwise step 2 is empty, ES-31). |
| Main behaviour | A stepper shows all four steps. **Next** validates only the current step. The user may return to any completed step without losing input. Step 4 is read-only with **Edit** links back to each step. |
| Inputs | Trip details (FR-019), partner selection (FR-023/FR-024), prices (FR-025…FR-027), deadline (FR-029). |
| Outputs | A submitted request (FR-030) or a saved draft (FR-022). |
| Validation | Per step, per FR-019 field rules; messages per FR-032. |
| Permissions | *Create / share request* (Sales, Admin). |
| Dependencies | TEQ Sales (customers, vehicles), Google Maps, BusNetwork Settings, S3. |
| Related business rule | BR-02, BR-08. |

#### FR-018 — Entry points and prefill from a TEQ trip
*Implements* BN-REQ-01 (intro: "share existing TEQ trips … opens this form already filled in"), BN-REQ-09 · MOD-03 · FEAT-10 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Open the request form (a) blank from the Request tab, (b) prefilled from an existing TEQ normal or fixed trip when the user chooses *Share* elsewhere in TEQ, or (c) at the saved step of a draft. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | For (b): the source TEQ trip exists and is visible to the user. |
| Main behaviour | Prefill copies type, customer, route, planned times, PAX and vehicle requirements, and shows a banner "Prefilled from TEQ trip 48213. Check the details before sharing." The source trip ID is carried in `source=<teqTripId>` and used for the back-link at submit (FR-031). |
| Inputs | `source` trip ID or `draft` ID. |
| Outputs | Populated step 1. |
| Validation | Prefilled values are validated like typed ones; a TEQ trip already shared is handled by ES-32 (**WA-30**, PQ-22). |
| Permissions | *Create / share request*. |
| Dependencies | TEQ Sales / Planning (integration failure → ES-27). |
| Related business rule | BR-09 (source trip must be in scope). |

#### FR-019 — Step 1 field rules
*Implements* BN-REQ-01 (trip details table) · MOD-03 · FEAT-09 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Enforce the BRD's field rules: trip type (required); customer and contact person (required, searchable or created inline); travel from/to (required, must resolve to map coordinates); up to 8 ordered via stops; planned start/end (required, end after start, start in the future); return date/time (required for round trips); PAX (whole number ≥ 1, not more than the selected vehicle type's capacity; optional on fixed trips where passenger count is off); vehicle requirements (optional); shifts (fixed trips only); flight no. / group ref. / sign (optional free text, max 100 characters — DR-14); comment fields (optional, max 2 000 characters each — DR-14). |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Step 1 open. |
| Main behaviour | Validation runs on **Next**, with an error summary at the top linking to each field and inline messages beneath fields. Via stops can be dragged to reorder and also moved by keyboard (NFR-013). Changing trip type after shifts are entered asks for confirmation. **WA-16:** a return time must be after planned start and not after planned end. |
| Inputs | Form fields. |
| Outputs | A valid step-1 payload. |
| Validation | Messages per FR-032, e.g. "End time must be after start time (start 2026-09-20 08:00)."; "PAX 62 is more than the 57 seats on 'Coach 57'."; "You can add up to 8 via stops." |
| Permissions | *Create / share request*. |
| Dependencies | Google Maps (ES-17), TEQ Sales customers and vehicle types. |
| Related business rule | BR-07 (times captured in the user's zone, stored UTC). |

#### FR-020 — Attachments
*Implements* BN-REQ-01 (attachments row) · MOD-03 · FEAT-09 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Accept up to 2 files per trip, each at most 10 MB, of type PDF, JPG, PNG or DOCX. |
| Actor | P-SALES, P-ADMIN (upload); both companies (download, FR-103). |
| Preconditions | Step 1 open, or the trip is not closed. |
| Main behaviour | Files are uploaded to S3, malware-scanned before they are shared (**DR-15**, NFR-011), and listed with name, size, uploader and time. |
| Inputs | Files. |
| Outputs | Attachment records; download links. |
| Validation | "'plan.xlsx' can't be attached. Use PDF, JPG, PNG or DOCX." · "'map.pdf' is 14 MB. The limit is 10 MB." · "You can attach up to 2 files." · infected file rejected (ES-16). |
| Permissions | Upload with *Create / share request*; download by any user on the trip. |
| Dependencies | File storage (S3). |
| Related business rule | BR-04 (attachments are visible to both companies on the trip). |

#### FR-021 — Fixed trips: shifts and sub-trips
*Implements* BN-REQ-01 (shifts row), BN-DTL-03 · MOD-03 · FEAT-09 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Require at least one shift with at least one sub-trip for a fixed trip, each sub-trip carrying from, to, start and end. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Trip type = Fixed. |
| Main behaviour | Shift cards with add/remove for shifts and sub-trips; sub-trip fields follow the same rules as the main route and schedule. For lifecycle purposes the trip's planned start is the **first sub-trip's start** and planned end the **last sub-trip's end** (**WA-09**, PQ-09). |
| Inputs | Shift name; sub-trip route and times. |
| Outputs | Shift/sub-trip records (DE-02). |
| Validation | "Add at least one shift with a sub-trip."; sub-trip end after start. |
| Permissions | *Create / share request*. |
| Dependencies | Google Maps. |
| Related business rule | BR-07. |

#### FR-022 — Save and resume a draft
*Implements* BN-REQ-02 · MOD-03 · FEAT-11 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Let the user save the request as a draft at any step without validation, and pick it up later from the Request tab at the step where it was saved. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Request form open. |
| Main behaviour | Drafts are listed as "My drafts" with created, last edited, trip type, route and step; visible to their creator and to Admins of the same company. A draft is **not** a trip: it appears in no trip list and has no status (BR-01). |
| Inputs | Partial form data, current step. |
| Outputs | Draft record (DE-07). |
| Validation | None on save; full validation applies when the draft is submitted. |
| Permissions | *Create / share request*; a draft is never visible to another company. |
| Dependencies | — |
| Related business rule | BR-01, BR-04. |

#### FR-023 — Partner picker limited to accepted affiliations
*Implements* BN-REQ-03 · MOD-03 · FEAT-12 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List, on step 2, only companies with an **accepted** affiliation, showing name, category, price agreement and rate, searchable and sortable by name. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Step 1 valid. |
| Main behaviour | The list is read live from BusNetwork Settings. Empty state: "No accepted partners yet. Partnerships are set up in BusNetwork Settings." The affiliation is re-checked at submit (FR-030, ES-09). |
| Inputs | Search text, sort direction. |
| Outputs | Selectable partner rows. |
| Validation | A partner whose affiliation is no longer accepted cannot be submitted. |
| Permissions | *Create / share request*. |
| Dependencies | BusNetwork Settings (unavailable → submit blocked, ES-27). |
| Related business rule | **BR-02**. |

#### FR-024 — Select several partners for one request
*Implements* BN-REQ-04 · MOD-03 · FEAT-12 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Allow multi-selection of partners, each receiving its own offer price and its own share request. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | At least one accepted affiliation. |
| Main behaviour | Selected count is displayed; step 3 shows one price row per selected partner; submit creates one share request per partner (FR-030). |
| Inputs | Partner selection. |
| Outputs | One `PENDING` share request per partner (DE-03). |
| Validation | "Choose at least one partner." |
| Permissions | *Create / share request*. |
| Dependencies | FR-023, FR-025. |
| Related business rule | BR-02, BR-03 (only the first acceptance wins). |

#### FR-025 — Offer price calculation per partner
*Implements* BN-REQ-05 (formula) · MOD-03 · FEAT-13 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Calculate each partner's offer price from its agreement: `percentage` → customer price × rate ÷ 100; `full_day` → the agreed full-day rate; `half_day` → the agreed half-day rate; no agreement → 0, and the user must enter a price before submitting. |
| Actor | System; values editable by P-SALES, P-ADMIN. |
| Preconditions | Partners selected; customer price entered for percentage agreements. |
| Main behaviour | Amounts use standard rounding (half away from zero) to 2 decimals and are stored as integer minor units (**DR-16**) in the host company's currency. A percentage row with no customer price shows "Enter a customer price to calculate" and blocks Next (ES-24). |
| Inputs | Customer price, agreement type and rate. |
| Outputs | Calculated offer price per partner. |
| Validation | Every offer price must be greater than 0 at submit (ES-08). |
| Permissions | *Create / share request*. |
| Dependencies | BusNetwork Settings (agreements), TEQ Company Settings (currency). |
| Related business rule | **BR-08**; **WA-17** (host currency throughout, PQ-13). |

#### FR-026 — Price override with attribution
*Implements* BN-REQ-05 ("Users can override it, and the override is recorded along with the user's name") · MOD-03 · FEAT-13 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the user replace any calculated offer price, and record the override with the calculated value, the new value, the user and the time. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Step 3 open; trip not yet Accepted (after acceptance, FR-068 applies). |
| Main behaviour | An overridden row shows "Calculated: 17 000,00 · Overridden by Ingrid Hansen" with a Reset control; a history entry is written (FR-105). |
| Inputs | New amount. |
| Outputs | Offer price + override flag + attribution (DE-03); history entry. |
| Validation | Amount > 0; currency and rounding per FR-025. |
| Permissions | *Create / share request*. |
| Dependencies | FR-105. |
| Related business rule | BR-05 (after acceptance the change needs both companies), BR-08, NFR-04. |

#### FR-027 — Additional costs per partner
*Implements* BN-REQ-06 · MOD-03 · FEAT-13 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Let the user add zero or more additional cost lines per partner (for example tolls or ferries), shown separately from the offer price. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Partner selected on step 3. |
| Main behaviour | Each line has a description and an amount; lines are visible to that partner only (BR-04) and are carried into that partner's invoice prefill (FR-083). |
| Inputs | Description, amount. |
| Outputs | Additional cost lines on the share request (DE-03). |
| Validation | Description required; amount ≥ 0; rounding per BR-08. |
| Permissions | *Create / share request*. |
| Dependencies | MOD-07 (prefill). |
| Related business rule | BR-04, BR-08. |

#### FR-028 — Quick share to a default partner
*Implements* BN-REQ-07 · MOD-03 · FEAT-17 · **Could (Later)**

| Aspect | Detail |
|---|---|
| System must | Offer, to users whose company has a default partner set, a **Quick share** that submits after step 1 to that partner at its unmodified agreement price, skipping steps 2 and 3. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | A default partner with an accepted affiliation and an agreement other than *none*. |
| Main behaviour | Quick share performs the same submit as FR-030 with one partner and no override. It is unavailable when the default partner's agreement is *none* (the price would be 0). |
| Inputs | Step-1 payload. |
| Outputs | A Requested trip with one share request. |
| Validation | As FR-030. |
| Permissions | *Create / share request*. |
| Dependencies | BusNetwork Settings (default partner). |
| Related business rule | BR-02, BR-08. |

#### FR-029 — Response deadline
*Implements* BN-REQ-08 · MOD-03 · FEAT-14 · **Should (R1.1 — recommended R1, §15.4)**

| Aspect | Detail |
|---|---|
| System must | Let the host set a response deadline on the request; if no partner has accepted by then, the request moves to **Rejected** with the reason "Expired" (FR-076). |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | Step 3 open. |
| Main behaviour | Optional date-time, in the future and **not after planned start**. When no deadline is set, it defaults to the planned start (**WA-10**, *blocking* **PQ-10**, with **Q6** for a per-company default). The deadline is shown to partners on the request and in N-01, and drives the 2-hour warning N-05. |
| Inputs | Date-time. |
| Outputs | `response_deadline` on the trip. |
| Validation | "The deadline must be in the future and no later than the planned start (2026-09-20 08:00)." (AC-REQ-08.2). |
| Permissions | *Create / share request*. |
| Dependencies | MOD-10 scheduler (FR-106), MOD-08 (N-05). |
| Related business rule | BR-07; OBJ-2. |

#### FR-030 — Submit the request
*Implements* BN-REQ-01, BN-REQ-04, BN-REQ-09 (transition T1) · MOD-03 · FEAT-15 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | On submit, create the network trip with status **Requested** and one `PENDING` share request per selected partner, and notify each partner. |
| Actor | P-SALES, P-ADMIN. |
| Preconditions | All four steps valid; every selected partner still has an accepted affiliation; every offer price > 0. |
| Main behaviour | One transaction: trip created; share requests created with agreement type, rate, calculated price, final price and additional costs as at submission; the source TEQ trip is marked shared and linked both ways (FR-031); history entry; N-01 to each partner's coordinators after commit (FR-099). The Submit button is disabled while submitting and a double click cannot create two trips (**DR-08**, ES-23). |
| Inputs | Complete form payload. |
| Outputs | Trip ID; share requests; TEQ back-link; notifications. |
| Validation | Guards above; failures leave nothing half-applied (**DR-05**). If the TEQ back-link cannot be written, submit is refused (ES-28). |
| Permissions | *Create / share request*. |
| Dependencies | Bus Network service, TEQ Sales, BusNetwork Settings, MOD-08. |
| Related business rule | **BR-02**, BR-01, BR-08. |

#### FR-031 — Submission confirmation and TEQ back-link
*Implements* BN-REQ-09 · MOD-03 · FEAT-10, FEAT-15 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show the new Trip ID with a link to the trip in Active Trips, and mark the original TEQ trip as shared with a link back to the network trip. |
| Actor | System. |
| Preconditions | Submit committed. |
| Main behaviour | Success screen: "Request sent to 2 partners. Trip ID 48213." with **Open in Active Trips** and **Create another request**. The TEQ trip shows "Shared via BusNetwork · 48213". |
| Inputs | Trip ID, partner count, source TEQ trip. |
| Outputs | Confirmation screen; back-link on both records. |
| Validation | — |
| Permissions | *Create / share request*. |
| Dependencies | TEQ Sales / Planning. |
| Related business rule | — |

#### FR-032 — Actionable validation messages
*Implements* BN-REQ-10 · MOD-03 · FEAT-09 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | State, in every validation message, which field is wrong and how to fix it, including the offending value where it helps. |
| Actor | System. |
| Preconditions | A validation rule fails. |
| Main behaviour | Inline message under the field plus an error summary at the top of the step linking to each field; the same wording is used by the API. Examples: "End time must be after start time (start 2026-09-20 08:00)."; "Enter an offer price for Nordfjord Buss — there is no price agreement."; "Choose an address from the suggestions so we can place it on the map." |
| Inputs | Validation failures. |
| Outputs | Field-level and summary messages. |
| Validation | Every rule in FR-019…FR-029 has a message reviewed against this requirement (AC-REQ-10.1). |
| Permissions | — |
| Dependencies | NFR-015 (all strings localised), NFR-013 (errors announced to assistive technology). |
| Related business rule | — |

#### FR-033 — Edit a Requested trip
*Implements* BN-ACT-04 (*Edit* action on Requested + shared) · MOD-03 · FEAT-16 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the host edit a trip while its status is Requested, including adding and removing partners, and record what changed. |
| Actor | P-SALES, P-ADMIN (host side only). |
| Preconditions | Trip status Requested; user holds *Create / share request*. |
| Main behaviour | The form reopens at step 1 with current values. On submit: a history entry per changed field; added partners get a new `PENDING` share request and N-01; removed partners' requests become `WITHDRAWN` with reason "Removed by host"; partners still pending see the updated details with an "Updated since you last viewed" marker and no extra notification (**WA-06**, PQ-06). |
| Inputs | Changed fields; changed partner selection. |
| Outputs | Updated trip; share request changes; history; notifications for added partners. |
| Validation | Same as FR-017…FR-029. An edit committed while a partner is accepting is resolved by ES-04. |
| Permissions | Host *Create / share request*. |
| Dependencies | MOD-06, MOD-08. |
| Related business rule | BR-02, BR-05 (price changes after acceptance are not this path). |

#### FR-034 — Draft retention
*Implements* BN-REQ-02 (lifecycle of a draft) · MOD-03 · FEAT-11 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Delete drafts that have been unused for 90 days, after warning the owner. |
| Actor | System. |
| Preconditions | Draft not edited for 83 days. |
| Main behaviour | A warning is sent 7 days before deletion; the owner can open the draft to reset the clock (**WA-18**, PQ-18). |
| Inputs | Draft last-edited timestamps. |
| Outputs | Warning notification; deletion. |
| Validation | Deletion never touches a submitted trip. |
| Permissions | System; owner and Admin may delete earlier. |
| Dependencies | MOD-10 (scheduled job), MOD-08. |
| Related business rule | NFR-04 (deletion of a draft is logged; drafts are not audit-retained business records). |

#### FR-035 — Money handling in the request
*Implements* BR-08 · MOD-03 · FEAT-13 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Hold every amount as integer minor units with an explicit currency, in the **host company's** currency, and round with standard rounding (half away from zero) to 2 decimals at the point of calculation. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | One rounding function is used by pricing and invoicing alike (NFR-016). Display follows the user's locale (NFR-015), e.g. `17 000,00 NOK` in nb_NO. |
| Inputs | Amounts and rates. |
| Outputs | Stored minor units; formatted display. |
| Validation | Rounding edge cases (x.xx5) are covered by tests (AC-REQ-05.1). |
| Permissions | — |
| Dependencies | TEQ Company Settings (currency). |
| Related business rule | **BR-08**; **WA-17** (PQ-13). |

### 6.4 MOD-04 — Trip lists (Active, Closed, All)

FR-036…FR-046 are the shared list component (BRD §8) used by Active Trips, Closed Trips, All Trips and the Invoice List. FR-047…FR-060 are what each list adds.

#### FR-036 — Paging and total count
*Implements* BN-LST-01 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Load one page at a time — default 25 rows, options 10 / 25 / 50 / 100 — and show the total number of matching rows. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | The total is shown above the table ("1 284 trips"). Changing any filter resets to page 1. Page size is remembered per user and list (DE-12). |
| Inputs | Page number, page size, current filters. |
| Outputs | Page of rows; total count; pager. |
| Validation | A page number beyond the result set shows the last page. |
| Permissions | Rows and totals are scope-limited (BR-09). |
| Dependencies | MOD-09, NFR-001. |
| Related business rule | BR-09. |

#### FR-037 — Free-text search
*Implements* BN-LST-02 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Match a single search box against Trip ID, from address, to address, company name and group reference. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | Case- and accent-insensitive substring match, debounced 300 ms, minimum 2 characters except for Trip ID digits. On the Invoice List the search additionally matches the invoice number (**DR-10**). |
| Inputs | Search text. |
| Outputs | Filtered rows and total. |
| Validation | — |
| Permissions | Searches only within the user's scope. |
| Dependencies | Search index (NFR-001, risk RP-4). |
| Related business rule | BR-04 (company name matched is the counterpart's), BR-09. |

#### FR-038 — Trip-start date range filter
*Implements* BN-LST-03 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Filter by trip start, where "From" counts from 00:00:00 and "To" counts to 23:59:59 in the user's time zone. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | The range is converted to a UTC window for the query (BR-07). Whole days are always included at both ends. |
| Inputs | From date, To date (`YYYY-MM-DD`). |
| Outputs | Filtered rows. |
| Validation | From after To is refused inline: "The 'From' date must be on or before the 'To' date" and the list is unchanged. |
| Permissions | — |
| Dependencies | User profile time zone. |
| Related business rule | **BR-07**. |

#### FR-039 — Company filter
*Implements* BN-LST-04 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer a company filter defaulting to "All companies", listing partners or hosts depending on which side of the trip the user's company is on. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | Options are the counterpart companies the user's company actually has trips with; with direction = All they are grouped "Partners" / "Hosts". |
| Inputs | Selected company. |
| Outputs | Filtered rows. |
| Validation | A company outside the user's scope passed in the URL is dropped (ES-14). |
| Permissions | Scope-limited. |
| Dependencies | FR-048 (direction). |
| Related business rule | BR-04, BR-09. |

#### FR-040 — Sort
*Implements* BN-LST-05 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Allow sorting by Trip ID, trip start, trip length, PAX and price, with the default sort being trip start — soonest first on Active Trips, most recent first on Closed and All Trips. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | One sort key at a time, ascending or descending; ties are broken by Trip ID ascending so paging is stable (**DR-11**). The Invoice List defaults to trip date descending (**WA-12**). |
| Inputs | Sort field and direction. |
| Outputs | Ordered rows. |
| Validation | — |
| Permissions | — |
| Dependencies | FR-036. |
| Related business rule | — |

#### FR-041 — Filters, sort and page in the URL
*Implements* BN-LST-06 · MOD-04, MOD-01 · FEAT-03, FEAT-18 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Keep filters, sort, page and page size in the URL, so a filtered view can be bookmarked or shared. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | Parameters per Appendix A. Opening the URL reproduces the view for any user with the same rights; parameters the opener may not use are dropped with a notice (ES-14). |
| Inputs | URL parameters. |
| Outputs | The list in the encoded state. |
| Validation | Unknown or invalid parameters are ignored, never fatal. |
| Permissions | The opener's own scope always applies. |
| Dependencies | FR-005. |
| Related business rule | BR-09. |

#### FR-042 — Date, time and duration formats
*Implements* BN-LST-07 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Store dates and times in UTC and show them in the user's time zone as `YYYY-MM-DD HH:MM`, and show trip length as `Xh Ym`. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | One conversion utility is used everywhere (NFR-016). Examples: `6h 30m`, `0h 45m`, `26h 10m`. Numbers and currency follow the user's locale (NFR-015). |
| Inputs | UTC timestamps, durations. |
| Outputs | Localised strings. |
| Validation | — |
| Permissions | — |
| Dependencies | User profile time zone and locale. |
| Related business rule | **BR-07**, BR-08. |

#### FR-043 — Empty states that explain
*Implements* BN-LST-08 · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Say why a list is empty and offer to clear the filters when any filter is set. |
| Actor | System. |
| Preconditions | Zero matching rows. |
| Main behaviour | Filtered: "No active trips match these filters." + **Clear filters**. Nothing exists yet: "No active trips right now." (with "Create a request" for Sales/Admin), "No closed trips yet.", "No trips yet.", "No invoices yet. Invoices are created from Completed trips." |
| Inputs | Filter state; result count. |
| Outputs | Empty-state message and action. |
| Validation | Clearing filters restores results. |
| Permissions | The offered action respects the role. |
| Dependencies | — |
| Related business rule | — |

#### FR-044 — Export the filtered view
*Implements* BN-LST-09 · MOD-04 · FEAT-19 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Export all rows matching the current filters and sort — not just the current page — as CSV and XLSX. |
| Actor | All personas (BRD §5: Export is allowed for every role). |
| Preconditions | List open with any filter state. |
| Main behaviour | Columns are the list's visible columns; dates are in the user's time zone with the zone named in the header row. Export is recorded in the audit log (**DR-12**). Up to 50 000 rows must complete within 60 s (NFR-003, `Proposed`). |
| Inputs | Current filters, sort, format. |
| Outputs | CSV or XLSX file. |
| Validation | More than 50 000 matching rows is refused before starting: "Narrow your filters to 50 000 rows or fewer." (**WA-28**, ES-21). |
| Permissions | Export never includes a field the user may not see (FR-103). |
| Dependencies | MOD-10 (audit), NFR-003. |
| Related business rule | BR-04, BR-09. |

#### FR-045 — Open a trip and return to the list
*Implements* BN-LST-10 · MOD-04, MOD-05 · FEAT-18, FEAT-23 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Open the trip detail page from a row, and restore the list's filters, sort, page and scroll position on return. |
| Actor | All personas. |
| Preconditions | Row visible. |
| Main behaviour | Row click or Enter on a focused row opens the detail; the list URL is carried as the return target (`from=<list URL>`); browser Back and the detail page's "Back to list" both restore the view. |
| Inputs | Selected row; return target. |
| Outputs | Trip detail; restored list. |
| Validation | — |
| Permissions | Opening a trip outside scope returns "Trip not found." (FR-104). |
| Dependencies | FR-005, FR-041. |
| Related business rule | BR-09. |

#### FR-046 — Standard trip columns
*Implements* BRD §8 *Standard trip columns* · MOD-04 · FEAT-18 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show the BRD's standard columns — Trip ID, Trip start, Trip length, From–To, PAX, Shift, Company, Type, Price, Status, Comments, Actions — plus Closed date and Invoice on Closed and All Trips. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | *From–To* renders `From → To` with a "+n" chip whose tooltip lists via stops in order, and uses the partner's alternative start address where one is set (FR-062). *Shift* shows the shift name for fixed trips and "N/A" for normal trips. *Company* is the counterpart for the viewing company. *Price* is the offer price that applies to the viewing company: the host sees the accepted partner's price, or "n prices" with a tooltip while several partners are pending; a partner sees only its own (BR-04). *Status* is a text label plus colour, never colour alone. *Comments* shows the count with an unread marker per user (**DR-13**). *Invoice* shows the invoice status pill or "Not invoiced", and "—" for Cancelled and Rejected. |
| Inputs | Trip record, viewing company, user read state. |
| Outputs | Rendered row. |
| Validation | — |
| Permissions | Field-level visibility per FR-103. |
| Dependencies | MOD-07 (invoice status), MOD-05 (comments). |
| Related business rule | **BR-04**, BR-01, NFR-07. |

#### FR-047 — Active Trips list contents
*Implements* BN-ACT-01 · MOD-04 · FEAT-20 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List exactly the trips whose company-view status is Requested, Accepted or In progress, using the shared list behaviour and standard columns. |
| Actor | All personas with trip-view rights. |
| Preconditions | Tab visible. |
| Main behaviour | The list queries one source with a status predicate only (**DR-01**); no other flag decides membership. Default sort: trip start ascending. |
| Inputs | Filters, sort, page. |
| Outputs | Rows, total, badge parity with FR-003. |
| Validation | — |
| Permissions | Scope-limited. |
| Dependencies | FR-079 (company-view status). |
| Related business rule | **BR-01**, BR-09. |

#### FR-048 — Direction filter
*Implements* BN-ACT-02 · MOD-04 · FEAT-20 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer All · Shared by us (host) · Received by us (partner). |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | The filter changes which side of the trip the company is on; it also drives the grouping of the company filter (FR-039). Closed Trips offers the same filter (BN-CLS-02). |
| Inputs | Direction choice. |
| Outputs | Filtered rows. |
| Validation | — |
| Permissions | — |
| Dependencies | FR-039. |
| Related business rule | BR-04. |

#### FR-049 — Active status filter
*Implements* BN-ACT-03 · MOD-04 · FEAT-20 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the user select one or more of Requested, Accepted and In progress. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | Multi-select; selecting none is the same as selecting all three. Selected values appear as chips and in the URL. |
| Inputs | Status selection. |
| Outputs | Filtered rows. |
| Validation | A closed status passed in the URL to this list is dropped (ES-14). |
| Permissions | — |
| Dependencies | FR-047. |
| Related business rule | BR-01. |

#### FR-050 — "Starts < 24 h" flag
*Implements* BN-ACT-08 · MOD-04 · FEAT-20 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Flag clearly, in the list, Requested trips whose planned start is within 24 hours. |
| Actor | System. |
| Preconditions | Status Requested; planned start within 24 h. |
| Main behaviour | An icon plus the text "Starts < 24 h" under the status pill — not colour alone (NFR-013). The flag is visual only: it does not change sort order, and it appears or disappears without a page reload when a trip crosses the 24-hour mark. |
| Inputs | Planned start, current time. |
| Outputs | Flag on the row. |
| Validation | Boundary: exactly 24 h is **not** flagged; 23 h 59 m is (ES-29). |
| Permissions | — |
| Dependencies | FR-046. |
| Related business rule | BR-07 (comparison in UTC). |

#### FR-051 — Closed Trips list contents
*Implements* BN-CLS-01 · MOD-04 · FEAT-21 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List exactly the trips whose company-view status is Completed, Cancelled or Rejected, with the standard columns plus Closed date and Invoice. |
| Actor | All personas with trip-view rights. |
| Preconditions | Tab visible. |
| Main behaviour | Default sort: trip start descending. Rows are read-only except for comments and invoice actions (FR-077). |
| Inputs | Filters, sort, page. |
| Outputs | Rows and total. |
| Validation | — |
| Permissions | Scope-limited. |
| Dependencies | FR-079. |
| Related business rule | **BR-01**, BR-06. |

#### FR-052 — Closed Trips filters
*Implements* BN-CLS-02 · MOD-04 · FEAT-21 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer status (multi-select of the three closed statuses), direction, and a **closed-date** range, in addition to the shared filters. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | The closed-date range uses the same whole-day rules as FR-038, applied to `closed_at`. |
| Inputs | Status, direction, closed From/To. |
| Outputs | Filtered rows. |
| Validation | As FR-038. |
| Permissions | — |
| Dependencies | FR-038, FR-048. |
| Related business rule | BR-07. |

#### FR-053 — Cancellation and rejection reason in the list
*Implements* BN-CLS-03 · MOD-04 · FEAT-21 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show the cancellation or rejection reason in the row, shortened, with the full text available, and in full on the detail page. |
| Actor | System. |
| Preconditions | Trip is Cancelled or Rejected and carries a reason. |
| Main behaviour | Truncated to 40 characters with the full text in a tooltip that is reachable by keyboard (NFR-013); the detail header shows it in full. The reason is the one recorded by the acting company and is shown to the other company (BN-ACT-05). |
| Inputs | Reason code and text. |
| Outputs | Row cell and detail header text. |
| Validation | — |
| Permissions | Visible to both companies on the trip. |
| Dependencies | FR-072, FR-073, FR-079. |
| Related business rule | BR-04. |

#### FR-054 — Invoice column
*Implements* BN-CLS-05 · MOD-04 · FEAT-21 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show the invoice's current status, linked to the invoice, or "Not invoiced". |
| Actor | System. |
| Preconditions | Trip is closed. |
| Main behaviour | Status pill (Draft / Pending / Approved / Declined) links to S-08; Cancelled and Rejected trips show "—" because they can never be invoiced (BR-06). |
| Inputs | Invoice record for the trip. |
| Outputs | Column cell with link. |
| Validation | — |
| Permissions | The link opens only for users who may view the invoice (Finance, Admin); others see the status without a link. |
| Dependencies | MOD-07. |
| Related business rule | **BR-06**, BR-04. |

#### FR-055 — "Completed, not invoiced" quick filter
*Implements* BN-CLS-07 · MOD-04 · FEAT-21 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Offer a one-click filter showing Completed trips received by the company that have no invoice other than Declined ones. |
| Actor | P-FIN, P-ADMIN (available to all roles that can see the list). |
| Preconditions | List open. |
| Main behaviour | Equivalent to status = Completed, direction = received, and no non-Declined invoice. A trip whose only invoices are Declined still needs billing, so it is included (**WA-22**). |
| Inputs | Chip selection. |
| Outputs | Filtered rows. |
| Validation | — |
| Permissions | — |
| Dependencies | MOD-07. |
| Related business rule | BR-06. |

#### FR-056 — All Trips list contents
*Implements* BN-ALL-01 · MOD-04 · FEAT-22 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List every trip where the user's company is host or partner, in all six statuses. |
| Actor | All personas with trip-view rights. |
| Preconditions | Tab visible. |
| Main behaviour | Same query model as FR-047 and FR-051 with the status predicate widened to all six. Default sort: trip start descending. |
| Inputs | Filters, sort, page. |
| Outputs | Rows and total, with a count line "412 trips (Active 37 · Closed 375)". |
| Validation | — |
| Permissions | Scope-limited. |
| Dependencies | FR-079. |
| Related business rule | **BR-01**, BR-09. |

#### FR-057 — Grouped status filter
*Implements* BN-ALL-02 · MOD-04 · FEAT-22 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | List all six statuses grouped under "Active" and "Closed" headings, with one option selecting a whole group. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | Ticking a heading selects its three statuses; untick clears them. Selections appear as chips and in the URL (`status`, `group`). |
| Inputs | Status / group selection. |
| Outputs | Filtered rows. |
| Validation | — |
| Permissions | — |
| Dependencies | FR-056. |
| Related business rule | BR-01. |

#### FR-058 — Totals reconcile across the three lists
*Implements* BN-ALL-03 · MOD-04 · FEAT-22 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Guarantee that, for the same filters, `count(All Trips) = count(Active Trips) + count(Closed Trips)`. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | Guaranteed by construction: all three lists are one query with a status predicate and no other membership flag (**DR-01**, BR-01), and each company's view status is derived once (FR-079). Verified by an automated reconciliation test over random filter combinations (AC-ALL-03.1). |
| Inputs | Any filter combination. |
| Outputs | Counts that reconcile. |
| Validation | Reconciliation test in CI; nightly consistency check (FR-107) for data-level drift. |
| Permissions | Holds within each user's scope. |
| Dependencies | FR-047, FR-051, FR-056, FR-079. |
| Related business rule | **BR-01**, BR-09; OBJ-5. |

#### FR-059 — Column chooser
*Implements* BN-ALL-05 · MOD-04 · FEAT-22 · **Could (Later)**

| Aspect | Detail |
|---|---|
| System must | Let a user show or hide columns on All Trips and remember the choice for that user. |
| Actor | All personas. |
| Preconditions | List open. |
| Main behaviour | Trip ID and Status cannot be hidden. The choice is stored per user and applies across devices (DE-12). |
| Inputs | Column selection. |
| Outputs | Rendered columns; stored preference. |
| Validation | — |
| Permissions | — |
| Dependencies | FR-046. |
| Related business rule | — |

#### FR-060 — Export including status history
*Implements* BN-ALL-06 · MOD-04 · FEAT-19 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Include, in the All Trips export, every column plus the status-change history of each exported trip. |
| Actor | All personas. |
| Preconditions | Export invoked from All Trips. |
| Main behaviour | XLSX: a second sheet; CSV: a second file. Columns: Trip ID, from status, to status, actor, company, at. |
| Inputs | Current filters and sort. |
| Outputs | Export file(s). |
| Validation | Same 50 000-row cap as FR-044. |
| Permissions | History entries the user may not see are excluded (FR-103). |
| Dependencies | FR-044, FR-105. |
| Related business rule | BR-04, NFR-04. |

### 6.5 MOD-05 — Trip detail and collaboration

#### FR-061 — Trip detail content
*Implements* BN-DTL-01 · MOD-05 · FEAT-23 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show the header (Trip ID, status, type, host, partner), the route with a map, the schedule, PAX, vehicle requirements, pricing, attachments and all comment fields. |
| Actor | All personas with trip-view rights. |
| Preconditions | Trip in the user's scope. |
| Main behaviour | One page serves every trip tab. Side panel: status with the next automatic change ("Moves to In progress at 2026-09-20 08:00"), partner responses (host), invoice block (closed trips), comment thread. What each side sees is filtered server-side per FR-103. |
| Inputs | Trip ID; viewing company and user. |
| Outputs | Rendered detail page. |
| Validation | — |
| Permissions | Scope and field visibility per MOD-09. |
| Dependencies | Google Maps, S3, MOD-06, MOD-07. |
| Related business rule | **BR-04**, BR-01. |

#### FR-062 — Alternative start address
*Implements* BN-DTL-02 · MOD-05 · FEAT-23 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show the partner's alternative start address instead of the original start address wherever the start address appears, when one has been set. |
| Actor | P-PCOORD, P-ADMIN of the accepted partner (set); everyone on the trip (see). |
| Preconditions | The partner's share request is `ACCEPTED`; the trip has not started (**WA-19**, PQ-19). |
| Main behaviour | The address goes through the same Maps validation as any other; the change is written to history; detail, lists and exports then show it with "Original: …" available. |
| Inputs | New address (must resolve to coordinates). |
| Outputs | Alternative start address on the trip; history entry. |
| Validation | Maps resolution required (ES-17); refused once the trip is In progress or closed. |
| Permissions | Accepted partner's Partner Coordinator or Admin (**WA-19**). |
| Dependencies | Google Maps, FR-105. |
| Related business rule | BR-04 (visible to both), NFR-04. |

#### FR-063 — Shifts and sub-trips on detail
*Implements* BN-DTL-03 · MOD-05 · FEAT-23 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show, for fixed trips, each shift with its sub-trips. |
| Actor | All personas with trip-view rights. |
| Preconditions | Trip type = Fixed. |
| Main behaviour | Shift cards listing sub-trip route and times, in order. |
| Inputs | Shift and sub-trip records (DE-02). |
| Outputs | Rendered shift section. |
| Validation | — |
| Permissions | Visible to both companies. |
| Dependencies | FR-021. |
| Related business rule | BR-04. |

#### FR-064 — Comment thread between host and partner
*Implements* BN-DTL-04 · MOD-05 · FEAT-24 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Provide a comment thread between host and partner, each comment showing author, company and time, and notify the other company when a comment is posted. |
| Actor | P-SALES, P-PCOORD, P-FIN, P-ADMIN (P-VIEW cannot comment). |
| Preconditions | Trip in scope; the user holds *Comment on trip*. Comments are allowed on closed trips too (BRD §9.4). |
| Main behaviour | Plain text, max 2 000 characters. A partner sees only its own thread with the host; partners never see each other's comments. The host sees a partner switcher when several partners have commented. Posting sends N-06. Read state is per user (**DR-13**) and drives the unread marker (FR-046) and the dashboard item (FR-010). |
| Inputs | Comment body. |
| Outputs | Comment record (DE-04); notification; unread markers. |
| Validation | Empty comment refused; comments cannot be edited or deleted once posted (**WA-20**, PQ-20, NFR-04). |
| Permissions | *Comment on trip*. |
| Dependencies | MOD-08. |
| Related business rule | **BR-04**, NFR-04. |

#### FR-065 — History log
*Implements* BN-DTL-05 · MOD-05 · FEAT-25 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show a log of every status change, price change and edit, with who made it and when. |
| Actor | All personas with trip-view rights. |
| Preconditions | Trip in scope. |
| Main behaviour | Newest first, filterable by type (All · Status · Price · Edits); each entry shows actor (user or "System"), company, time and before → after. A partner sees entries about the trip and its own request only — never other partners' prices or responses. |
| Inputs | History entries (DE-05). |
| Outputs | Timeline. |
| Validation | Entries are append-only and cannot be modified (FR-105). |
| Permissions | Filtered per FR-103. |
| Dependencies | MOD-10. |
| Related business rule | **BR-04**, NFR-04. |

#### FR-066 — Detail actions match list actions
*Implements* BN-DTL-06, BN-ALL-04 · MOD-05, MOD-06 · FEAT-23, FEAT-28 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer, on the detail page, exactly the actions the list offers for the same trip, status, side and role — and the same on Active, Closed and All Trips. |
| Actor | All personas. |
| Preconditions | — |
| Main behaviour | One action matrix (FR-069) drives every surface, so an action never appears in one place and not another. |
| Inputs | Trip status, side, user role. |
| Outputs | Action buttons. |
| Validation | Verified for every matrix row (AC-ACT-04.1, AC-DTL-06.1, AC-ALL-04.1). |
| Permissions | Per FR-101. |
| Dependencies | MOD-06. |
| Related business rule | BR-01. |

#### FR-067 — Consistency flag
*Implements* BRD §14 risk "Trip data differs between the TEQ trip and the network copy" (mitigation: nightly check, flag on the detail page) · MOD-05, MOD-10 · FEAT-26 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show, on the trip detail page, a flag naming any field where the network copy and the linked TEQ trip differ, with the values and when they were checked. |
| Actor | System (raises); all personas on the trip (see). |
| Preconditions | The nightly check (FR-107) found a mismatch. |
| Main behaviour | Banner: "This trip differs from the TEQ trip: planned start 08:00 vs 08:30 (checked 02:00)". Nothing is auto-overwritten (ES-12). The flag is visible to a partner only for fields the partner may see. |
| Inputs | Consistency flag records (DE-13). |
| Outputs | Banner; resolution when the next check finds no difference. |
| Validation | — |
| Permissions | Field visibility per FR-103. |
| Dependencies | FR-107. |
| Related business rule | BR-04. |

#### FR-068 — Price change after acceptance
*Implements* BR-05 · MOD-05 · FEAT-27 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Require agreement from both companies to change the price of an Accepted trip, and record the agreement as a comment and in the history log. |
| Actor | Host P-SALES / P-ADMIN propose; partner P-PCOORD / P-ADMIN confirm or decline (**WA-21**, PQ-21). |
| Preconditions | Trip status Accepted or In progress; a partner has accepted. |
| Main behaviour | The host opens **Propose price change** (new offer price + required comment). The partner sees **Confirm** / **Decline** on the detail page. Only on Confirm does the offer price change; proposal, confirmation and decline are each posted as a comment and written to history. The price field is not otherwise editable after acceptance. |
| Inputs | New amount, comment. |
| Outputs | Proposal record; on confirm, updated offer price; comments; history entries. |
| Validation | Amount > 0; rounding per BR-08; refused on closed trips (FR-077). |
| Permissions | As above; no other role may change an accepted price. |
| Dependencies | MOD-08 (N-06), FR-105. |
| Related business rule | **BR-05**, BR-08, NFR-04. |

### 6.6 MOD-06 — Trip lifecycle and actions

The transition table (T1…T7) with guards and side effects is Appendix B; the requirements below are what the product must do.

#### FR-069 — One action matrix for status, side and role
*Implements* BN-ACT-04, BN-DTL-06, BN-ALL-04 · MOD-06 · FEAT-28 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer an action only when the trip's company-view status, the viewing company's side and the user's role all allow it, using one matrix for lists, detail and bulk actions. |
| Actor | All acting personas. |
| Preconditions | Trip in scope. |
| Main behaviour | Matrix: **Requested · received** → Accept, Reject (P-PCOORD, P-ADMIN). **Requested · shared** → Edit (P-SALES, P-ADMIN), Cancel (P-SALES, P-PCOORD, P-ADMIN). **Accepted · either** → Cancel, Comment. **In progress · either** → Comment; **received** also → Mark complete (P-PCOORD, P-ADMIN — WA-05). **Completed · received** → Create invoice (P-FIN, P-ADMIN — WA-04); **either** → View invoice. **Any closed** → Comment. **Any** → View, Export (all roles including P-VIEW). |
| Inputs | Status, side, role. |
| Outputs | The permitted action set. |
| Validation | The UI hides what is not allowed; the server refuses it regardless (**DR-02**). |
| Permissions | BRD §5 matrix extended by FR-101. |
| Dependencies | FR-079, MOD-09. |
| Related business rule | BR-01, BR-09. |

#### FR-070 — Accept a request
*Implements* BN-ACT-06 (T2) · MOD-06 · FEAT-29 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the partner accept a received request, set the trip to **Accepted**, and notify the host user who created it. |
| Actor | P-PCOORD, P-ADMIN of the partner company. |
| Preconditions | The trip is still Requested **and** this partner's share request is still `PENDING`; the response deadline has not passed. |
| Main behaviour | A confirmation dialog shows offer price, additional costs, planned start and route, and warns that other partners' requests will be withdrawn. Accept commits T2 as an **atomic conditional update** (**DR-04**): the share request becomes `ACCEPTED`, the trip becomes Accepted, all other `PENDING` requests become `WITHDRAWN` in the same transaction (FR-071); N-02 to the host creator; history entry. |
| Inputs | Confirmation. |
| Outputs | Accepted trip; withdrawn siblings; notifications; history. |
| Validation | Refusals are shown in the dialog: "Already taken — another partner accepted this trip." (ES-01), "This request expired at 12:00." (ES-02), "Nordic Coaches cancelled this request: {reason}." (ES-03). |
| Permissions | Partner Coordinator, Admin of the receiving company. |
| Dependencies | MOD-08, FR-105. |
| Related business rule | **BR-03**, BR-01. |

#### FR-071 — First accept wins; other offers withdrawn
*Implements* BN-ACT-07, BR-03 · MOD-06 · FEAT-29 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Give the trip to the first partner that accepts, withdraw the other partners' requests automatically, and notify them. |
| Actor | System, on T2. |
| Preconditions | More than one `PENDING` share request. |
| Main behaviour | In the accepting transaction every other `PENDING` request becomes `WITHDRAWN`; each affected partner receives N-03 in-app and sees the trip as **Cancelled · "Another partner accepted"** (FR-079, WA-01). Exactly one share request can ever be `ACCEPTED`. |
| Inputs | Accept event. |
| Outputs | Withdrawn requests; notifications; history. |
| Validation | Concurrency test with 20 parallel accepts: exactly one succeeds (AC-ACT-07.2). Whether "first to accept wins" is the right model at all is **Q4**. |
| Permissions | System. |
| Dependencies | FR-070. |
| Related business rule | **BR-03**; **Q4**. |

#### FR-072 — Reject a request with a reason
*Implements* BN-ACT-05 (T3a / T3b) · MOD-06 · FEAT-30 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Require a reason when a partner rejects, record it, show it to the other company, and set the trip to **Rejected** once no pending partner remains. |
| Actor | P-PCOORD, P-ADMIN of the partner company. |
| Preconditions | This partner's share request is `PENDING`. |
| Main behaviour | A modal requires a reason from a list or *Other* with free text of at least 5 characters. The partner's request becomes `REJECTED`; that partner now sees the trip as **Rejected** with its own reason. The host still sees **Requested** while another partner is pending; when the last pending partner rejects, the trip becomes **Rejected** with reason "Rejected by all partners" and the host creator is notified (N-02). Starter reason list (**WA-07**, PQ-07): No vehicle available · No driver available · Price too low · Outside our operating area · Timing not possible · Other. |
| Inputs | Reason code and optional text. |
| Outputs | Rejected share request; possibly Rejected trip; notification; history. |
| Validation | Without a reason the action cannot be confirmed, in the UI and in the API. |
| Permissions | Partner Coordinator, Admin. |
| Dependencies | FR-079, MOD-08. |
| Related business rule | BR-01, BR-04. |

#### FR-073 — Cancel a trip with a reason
*Implements* BN-ACT-05 (T4) · MOD-06 · FEAT-30 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the host or the accepted partner cancel a Requested or Accepted trip with a mandatory reason, set the trip to **Cancelled**, and notify the other company. |
| Actor | P-SALES, P-PCOORD, P-ADMIN (holders of *Cancel trip*). |
| Preconditions | Status Requested or Accepted. A partner may cancel only when its request is `ACCEPTED`; a pending partner *rejects* instead. |
| Main behaviour | Reason list (**WA-07**): Customer cancelled · Trip details changed · Vehicle not available · Driver not available · Duplicate request · Other. Pending share requests become `WITHDRAWN`; N-04 to the other company in-app and by email, plus SMS when the trip starts within 24 hours; history entry. The dialog warns when SMS will be sent. |
| Inputs | Reason code and optional text. |
| Outputs | Cancelled trip; notifications; history. |
| Validation | Reason required. Cancelling an **In progress** trip is not offered and the API refuses it: "In progress trips can't be cancelled." (**PQ-08**, ES-05). |
| Permissions | *Cancel trip (with reason)*. |
| Dependencies | MOD-08, FR-105. |
| Related business rule | BR-01, BR-04. |

#### FR-074 — Mark complete
*Implements* BRD §7 (In progress → Completed, "triggered by System / Partner", T7) · MOD-06 · FEAT-31 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the partner mark an In progress trip as Completed before its planned end. |
| Actor | P-PCOORD, P-ADMIN of the partner company (**WA-05**, PQ-05). |
| Preconditions | Status In progress. |
| Main behaviour | Confirmation dialog: "Mark trip 48213 as completed now? It moves to Closed Trips and can be invoiced." On confirm: status Completed, `closed_at` set, history entry; the trip leaves Active Trips and appears in Closed Trips with Invoice = "Not invoiced". |
| Inputs | Confirmation. |
| Outputs | Completed trip; history. |
| Validation | Refused from any other status. |
| Permissions | Partner Coordinator, Admin of the receiving company. |
| Dependencies | MOD-07 (invoicing becomes possible). |
| Related business rule | BR-01, **BR-06**; **Q5**. |

#### FR-075 — Scheduler-driven status changes
*Implements* BRD §7 (Accepted → In progress at planned start; In progress → Completed at planned end), BRD §13 *TEQ Scheduler* (T5, T6) · MOD-06, MOD-10 · FEAT-31, FEAT-49 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Move Accepted trips to **In progress** when the planned start is reached, and In progress trips to **Completed** when the planned end is reached. |
| Actor | System (TEQ Scheduler). |
| Preconditions | `now ≥ planned_start_utc` / `now ≥ planned_end_utc`. |
| Main behaviour | Minute-level jobs; each transition writes a history entry with actor "System"; the detail page shows the next automatic change. For fixed trips, planned start and end are the first sub-trip's start and the last sub-trip's end (**WA-09**). Automatic completion is behind a setting so it can be switched off if **Q5** is decided the other way. Jobs are idempotent: a re-run never repeats a transition or a notification (**DR-08**). |
| Inputs | Planned times; current time. |
| Outputs | Status changes; history. |
| Validation | Timeliness ≤ 5 minutes after the due moment (**DR-07**, NFR-006); a late job is alerted and catches up (ES-10). |
| Permissions | System only. |
| Dependencies | TEQ Scheduler (dependency D-2). |
| Related business rule | **BR-01**, BR-07; **Q5**. |

#### FR-076 — Expire an unanswered request
*Implements* BN-REQ-08, BRD §7 (Requested → Rejected when the deadline passes; T3c) · MOD-06 · FEAT-32 · **Should (R1.1 — recommended R1)**

| Aspect | Detail |
|---|---|
| System must | Move a Requested trip to **Rejected** with the reason "Expired" when the response deadline passes with no acceptance, and notify the host creator. |
| Actor | System (TEQ Scheduler). |
| Preconditions | `now ≥ response_deadline`; no share request is `ACCEPTED`. |
| Main behaviour | Pending share requests become `EXPIRED`; the trip's closed reason is "Expired"; N-02 (rejected/expired) to the host creator; history entry. Two hours before the deadline, N-05 is sent once to the host creator. Partners see the trip as **Rejected · "Expired"** (FR-079). |
| Inputs | Deadline; current time. |
| Outputs | Rejected trip; notifications; history. |
| Validation | Timeliness ≤ 5 minutes (**DR-07**). An accept attempted after expiry is refused (ES-02). |
| Permissions | System only. |
| Dependencies | FR-029, FR-106, MOD-08. |
| Related business rule | BR-01; OBJ-2; **Q6**, **PQ-10**. |

#### FR-077 — Closed trips are immutable
*Implements* BN-CLS-06 · MOD-06 · FEAT-33 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Prevent any edit or status change on a Completed, Cancelled or Rejected trip; only commenting and invoice actions remain. |
| Actor | System. |
| Preconditions | Trip in a closed status. |
| Main behaviour | No edit or status action is offered on any surface; the API refuses with "Closed trips can't be changed." (ES-06). Reopening is not supported in this release (**Q3**). |
| Inputs | Any attempted change. |
| Outputs | Refusal; audit entry of the attempt. |
| Validation | Verified per status and role (AC-CLS-06.1). |
| Permissions | No role may override. |
| Dependencies | FR-069. |
| Related business rule | **BR-01**, BR-06; **Q3**. |

#### FR-078 — Bulk accept or reject received requests
*Implements* BN-ACT-09 · MOD-06 · FEAT-34 · **Could (Later)**

| Aspect | Detail |
|---|---|
| System must | Let a partner user accept or reject several received requests at once, using the same reason for all rejections. |
| Actor | P-PCOORD, P-ADMIN. |
| Preconditions | Rows where Accept/Reject is allowed. |
| Main behaviour | Checkboxes appear only on eligible rows; a bar shows "3 selected · Accept · Reject". Each trip is processed independently under the same guards as FR-070 and FR-072; results are reported per trip ("5 accepted, 1 already taken") and one failure never blocks the others. |
| Inputs | Selected trips; reason for bulk reject. |
| Outputs | Per-trip results; notifications; history entries. |
| Validation | Partial failure is normal and reported, never silent (ES-01, AC-ACT-09.1). |
| Permissions | As FR-070 / FR-072. |
| Dependencies | FR-069. |
| Related business rule | BR-03. |

#### FR-079 — Company-view status
*Implements* BR-01 applied to multi-partner requests (BN-REQ-04, BN-ACT-05/07) · MOD-06 · FEAT-35 · **Must (R1)** · **WA-01, blocking PQ-01**

| Aspect | Detail |
|---|---|
| System must | Show each company exactly one status per trip: the host sees the trip status; a partner sees a status derived from its own share request. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | Mapping: `PENDING` → Requested · `ACCEPTED` → the trip status (Accepted / In progress / Completed / Cancelled) · `REJECTED` → Rejected, with that partner's own reason · `EXPIRED` → Rejected, reason "Expired" · `WITHDRAWN` because another partner accepted → Cancelled, reason "Another partner accepted" · `WITHDRAWN` because the host cancelled → Cancelled with the host's reason · `WITHDRAWN` because the host removed the partner during Edit → Cancelled, reason "Removed by host". |
| Inputs | Trip status; the viewing company's share request state. |
| Outputs | One status and one reason per viewing company; drives list membership, badges, filters and counts. |
| Validation | Every trip appears in exactly one of Active / Closed and in All, for every company (AC-ALL-03.1). |
| Permissions | A company only ever sees its own derived status. |
| Dependencies | FR-047, FR-051, FR-056. |
| Related business rule | **BR-01**, BR-04; **PQ-01** (blocking R1). |

#### FR-080 — Create a quotation in the partner's own TEQ account
*Implements* BN-ACT-06 ("The partner can then turn the trip into a quotation in its own TEQ account") · MOD-06 · FEAT-29 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer the accepting partner a way to create a quotation from the accepted trip in its own TEQ account. |
| Actor | P-PCOORD, P-ADMIN of the accepting company. |
| Preconditions | This company's share request is `ACCEPTED`. |
| Main behaviour | **Create quotation in TEQ** opens TEQ Sales with the trip prefilled in the partner's own account. The quotation's own ID never replaces the shared Trip ID (BRD §6). |
| Inputs | Trip data visible to the partner (FR-103). |
| Outputs | A prefilled quotation in TEQ Sales; link recorded on the trip. |
| Validation | Unavailable before acceptance and on closed trips. |
| Permissions | Accepting partner only. |
| Dependencies | TEQ Sales / Planning (unavailable → ES-27). |
| Related business rule | BR-04. |

### 6.7 MOD-07 — Invoicing and settlement

The invoice transition table (I1…I6) is Appendix B.2.

#### FR-081 — Create an invoice from a Completed trip
*Implements* BN-CLS-04 (I1) · MOD-07 · FEAT-36 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the partner company create a **Draft** invoice from a Completed trip it received, prefilled with the agreed offer price and any additional costs. |
| Actor | P-FIN, P-ADMIN of the partner company (**WA-04**, *blocking* **PQ-04**). |
| Preconditions | Trip status Completed; the company is the accepted partner; no non-Declined invoice exists for the trip. |
| Main behaviour | *Create invoice* appears on the Closed Trips row and on the trip detail; choosing it creates the Draft and opens it (S-08). |
| Inputs | Trip ID. |
| Outputs | Draft invoice (DE-08) with prefilled lines (FR-083); history entry. |
| Validation | Refused for any non-Completed trip: "Only Completed trips can be invoiced." (ES-07). |
| Permissions | Finance, Admin of the partner company. |
| Dependencies | MOD-06, TEQ Company Settings. |
| Related business rule | **BR-06**, BR-04. |

#### FR-082 — One active invoice per trip
*Implements* BN-INV-03 · MOD-07 · FEAT-36 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Allow at most one invoice per trip that is not Declined. |
| Actor | System. |
| Preconditions | An invoice exists for the trip. |
| Main behaviour | A second creation attempt is refused: "Trip 48213 already has invoice BN-INV-2026-000184 (Pending)." After a decline, a new version of the same invoice is allowed (FR-089). |
| Inputs | Create request. |
| Outputs | Refusal or new Draft. |
| Validation | Enforced in the same transaction as creation; concurrent attempts cannot both succeed (ES-20). |
| Permissions | — |
| Dependencies | FR-081, FR-089. |
| Related business rule | **BR-06**. |

#### FR-083 — Invoice prefill and VAT
*Implements* BN-INV-04 · MOD-07 · FEAT-36 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Prefill a new invoice with the agreed offer price and additional costs, adding VAT according to the partner company's VAT settings. |
| Actor | System. |
| Preconditions | Draft being created. |
| Main behaviour | Line 1 = the agreed offer price, description "Trip 48213, 2026-09-20, Oslo → Bergen", quantity 1; one line per additional cost; VAT rate from TEQ Company Settings; the trip's invoice comment and invoice reference are carried over. Invoice number `BN-INV-YYYY-NNNNNN`, unique platform-wide and sequential per year, assigned at creation (**WA-24**). |
| Inputs | Share request (price, additional costs), company VAT settings. |
| Outputs | Prefilled lines and totals; invoice number. |
| Validation | Creation is blocked with a specific message if Company Settings are unavailable (ES-27). |
| Permissions | Finance, Admin of the partner company. |
| Dependencies | TEQ Company Settings. |
| Related business rule | BR-08; **WA-17** (host currency, PQ-13). |

#### FR-084 — Extra invoice lines
*Implements* BN-INV-05 · MOD-07 · FEAT-37 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the partner add extra lines — for example waiting time, tolls or extra kilometres — each with description, quantity, unit price and VAT rate. |
| Actor | P-FIN, P-ADMIN of the partner company. |
| Preconditions | Invoice status Draft (or Declined, being edited for resubmission). |
| Main behaviour | Lines can be added, edited and removed while the invoice is editable; each line records its source (offer price / additional cost / extra) (DE-09). |
| Inputs | Description, quantity, unit price, VAT rate. |
| Outputs | Invoice lines; recalculated totals (FR-085). |
| Validation | Description required ("Add a description for line 3."); quantity > 0 with up to 2 decimals; unit price ≥ 0; VAT rate from the company's allowed rates. |
| Permissions | Finance, Admin of the issuing company. |
| Dependencies | FR-085. |
| Related business rule | BR-08. |

#### FR-085 — Invoice calculation and rounding
*Implements* BN-INV-04/05 with BR-08 (**DR-17**) · MOD-07 · FEAT-37 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Calculate line net = quantity × unit price rounded to 2 decimals; line VAT = line net × rate ÷ 100 rounded to 2 decimals; totals as the sum of lines, using standard rounding. |
| Actor | System. |
| Preconditions | Invoice has at least one line. |
| Main behaviour | Totals are shown as excl. VAT, VAT and total, right-aligned with tabular figures, in the host company's currency (**WA-17**). The same rounding function as pricing is used (NFR-016). |
| Inputs | Lines. |
| Outputs | Line and invoice totals. |
| Validation | Rounding edge cases tested (AC-INV-04.1, AC-INV-05.1). |
| Permissions | — |
| Dependencies | FR-035. |
| Related business rule | **BR-08**. |

#### FR-086 — Submit an invoice
*Implements* BRD §9.6 status table (I3) · MOD-07 · FEAT-38 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the partner send a Draft invoice to the host, setting it to **Pending** and notifying the host's finance users. |
| Actor | P-FIN, P-ADMIN of the partner company. |
| Preconditions | Status Draft; at least one line; all lines valid. |
| Main behaviour | `submitted_at` recorded; N-07 to host finance; the host's Invoice List badge and dashboard figure increase (FR-004, FR-007). A double click submits once (**DR-08**). |
| Inputs | Confirmation. |
| Outputs | Pending invoice; notification; history. |
| Validation | Refused with no valid lines. |
| Permissions | Finance, Admin of the issuing company. |
| Dependencies | MOD-08. |
| Related business rule | BR-04. |

#### FR-087 — Approve an incoming invoice
*Implements* BN-INV-06 (I4) · MOD-07 · FEAT-38 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the host approve a Pending incoming invoice, locking all amounts. |
| Actor | P-FIN, P-ADMIN of the host company. |
| Preconditions | Status Pending; the invoice is incoming for this company. |
| Main behaviour | Confirmation dialog states that amounts will be locked. On approve: status Approved, `decided_at` and `decided_by` recorded, lines and totals snapshotted (FR-092), N-08 to partner finance, history entry. |
| Inputs | Confirmation. |
| Outputs | Approved invoice with snapshot; notification; audit entry. |
| Validation | No edit is possible afterwards, by any role. |
| Permissions | *Approve / decline invoice*. |
| Dependencies | MOD-08, NFR-017. |
| Related business rule | BR-04, NFR-04. |

#### FR-088 — Decline an incoming invoice with a reason
*Implements* BN-INV-06 (I5) · MOD-07 · FEAT-38 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the host decline a Pending incoming invoice with a mandatory reason, and notify the partner. |
| Actor | P-FIN, P-ADMIN of the host company. |
| Preconditions | Status Pending. |
| Main behaviour | Reason from a list or *Other* with free text; starter list (**WA-07**, PQ-07): Amount doesn't match agreement · Extra lines not agreed · Missing documentation · Wrong VAT · Other. Status Declined, `decided_at`/`decided_by` and reason recorded, amounts snapshotted, N-08 to partner finance. |
| Inputs | Reason code and optional text. |
| Outputs | Declined invoice; notification; audit entry. |
| Validation | The Decline button stays disabled until a reason is given, and the API refuses without one (ES-19). |
| Permissions | *Approve / decline invoice*. |
| Dependencies | MOD-08. |
| Related business rule | BR-04, NFR-04. |

#### FR-089 — Edit and resubmit a declined invoice as a new version
*Implements* BRD §9.6 ("the partner can edit it and send it again as a new version"; I6) · MOD-07 · FEAT-39 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let the partner edit a Declined invoice and send it again as a new version of the same invoice number. |
| Actor | P-FIN, P-ADMIN of the partner company. |
| Preconditions | Status Declined. |
| Main behaviour | **Edit & resubmit** creates version `v2` (then `v3`…) of the same invoice number as a Draft, which is submitted as usual; the declined version stays read-only and remains viewable through a version switcher (**WA-11**, PQ-11). |
| Inputs | Edited lines. |
| Outputs | New version; on submit, Pending; notification. |
| Validation | Two concurrent resubmissions create one new version; the second attempt sees it (ES-20). |
| Permissions | Finance, Admin of the issuing company. |
| Dependencies | FR-082, FR-086. |
| Related business rule | **BR-06**, NFR-04. |

#### FR-090 — Invoice sub-tabs and archive
*Implements* BN-INV-01 · MOD-07 · FEAT-40 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Provide separate *Incoming*, *Outgoing* and *Archive* sub-tabs, where Archive holds Approved and Declined invoices older than 90 days. |
| Actor | P-FIN, P-ADMIN. |
| Preconditions | Invoice List open. |
| Main behaviour | Age is measured from `decided_at` (**WA-25**); an archived invoice is removed from Incoming/Outgoing. A company that is both host and partner sees all three sub-tabs. |
| Inputs | Sub-tab selection. |
| Outputs | The matching invoice set. |
| Validation | Boundary: decided 90 days ago exactly is still in Incoming/Outgoing; 91 days is in Archive (AC-INV-01.1, ES-29). |
| Permissions | Finance, Admin. |
| Dependencies | FR-087, FR-088. |
| Related business rule | BR-04. |

#### FR-091 — Invoice filters and columns
*Implements* BN-INV-02, BRD §9.6 columns · MOD-07 · FEAT-40 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Offer filters for status, company, trip date range and invoice date range, plus the shared search, sort and pagination, and show the BRD's invoice columns. |
| Actor | P-FIN, P-ADMIN. |
| Preconditions | Invoice List open. |
| Main behaviour | Columns: Invoice no., Direction, Trip ID (linked), Company, Customer *(host only — BR-04)*, Trip date, Amount excl. VAT, VAT, Total, Status, Submitted, Decided, Actions. Invoice date = submitted date; Drafts use their created date (**WA-26**). Default sort trip date descending (**WA-12**). |
| Inputs | Filter and sort state. |
| Outputs | Filtered, sorted, paged invoice rows. |
| Validation | Date ranges follow FR-038 rules. |
| Permissions | The *Customer* column is absent from a partner's list and export (AC-INV-cust). |
| Dependencies | FR-036…FR-042. |
| Related business rule | **BR-04**, BR-07. |

#### FR-092 — Amounts locked at the decision
*Implements* BN-INV-07 · MOD-07 · FEAT-41 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Show, after an invoice is Approved or Declined, the amounts as they were at that moment — never a fresh calculation from the trip. |
| Actor | System. |
| Preconditions | Invoice decided. |
| Main behaviour | Lines and totals are snapshotted at the decision; the list, the invoice page and the PDF all read the snapshot. A later change to the trip's offer price does not alter a decided invoice. |
| Inputs | Decision event. |
| Outputs | Immutable snapshot on the invoice (DE-08). |
| Validation | AC-INV-07.1. |
| Permissions | No role may edit a decided invoice. |
| Dependencies | FR-087, FR-088. |
| Related business rule | NFR-04. |

#### FR-093 — Invoice PDF
*Implements* BN-INV-09 · MOD-07 · FEAT-42 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Produce a PDF of any invoice in the viewing company's language, showing both companies' details. |
| Actor | P-FIN, P-ADMIN (**WA-04**). |
| Preconditions | Invoice exists. |
| Main behaviour | The PDF contains both companies' name, address, org no. and VAT no., the invoice number and version, the trip reference, the lines, VAT per rate, totals, status and decided date. Generated on demand and stored in S3. |
| Inputs | Invoice (snapshot where decided). |
| Outputs | PDF file. |
| Validation | Language follows NFR-015; a decided invoice's PDF uses the snapshot. |
| Permissions | Finance, Admin of either company on the invoice. |
| Dependencies | TEQ Company Settings, S3. |
| Related business rule | BR-04, NFR-06. |

#### FR-094 — Invoice list footer totals
*Implements* BN-INV-10 · MOD-07 · FEAT-40 · **Should (R1.1)**

| Aspect | Detail |
|---|---|
| System must | Show, in the list footer, the totals for **all** filtered invoices — excl. VAT, VAT and total — not just the current page. |
| Actor | P-FIN, P-ADMIN. |
| Preconditions | Invoice List with any filter state. |
| Main behaviour | "Totals for 60 invoices: 142 300,00 · 35 575,00 · 177 875,00 NOK". If the filtered set spans currencies, one row per currency (**WA-17**). |
| Inputs | Current filters. |
| Outputs | Footer totals. |
| Validation | AC-INV-10.1 (footer equals the sum of all matching invoices across pages). |
| Permissions | Scope-limited. |
| Dependencies | FR-091. |
| Related business rule | BR-08. |

#### FR-095 — Delete a Draft invoice
*Implements* BRD §9.6 (Draft = "created … but not yet sent") with NFR-04 · MOD-07 · FEAT-40 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Allow the issuing company to delete a Draft invoice, and nothing else to be deleted. |
| Actor | P-FIN, P-ADMIN of the issuing company. |
| Preconditions | Status Draft; never submitted. |
| Main behaviour | A Draft was never sent, so deleting it removes no shared record; the deletion is logged. Submitted, Approved and Declined invoices and all versions are never deleted (**WA-23**). |
| Inputs | Confirmation. |
| Outputs | Draft removed; audit entry. |
| Validation | Refused for any other status. |
| Permissions | Issuing company's Finance or Admin. |
| Dependencies | NFR-017. |
| Related business rule | NFR-04. |

### 6.8 MOD-08 — Notifications

The event catalogue N-01…N-08 with recipients, channels and message text is Appendix E.

#### FR-096 — Lifecycle notifications
*Implements* BRD §11 · MOD-08 · FEAT-43 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Send a notification for each event in BRD §11 to the recipients and on the channels listed there: new request received; request accepted / rejected; offer withdrawn; trip cancelled; request expiring in 2 h; new comment; invoice submitted; invoice approved / declined. |
| Actor | System. |
| Preconditions | The causing action has committed. |
| Main behaviour | Notifications are sent **after commit** and never block or roll back the action that caused them (**DR-09**). Each message deep-links to the trip or invoice. Recipients are resolved as "users on the trip" — the host user who created the request plus users who acted on or commented on it, plus the counterpart role named in BRD §11 — limited to users whose departments include the trip (**WA-27**, PQ-17). |
| Inputs | Event, subject, recipients. |
| Outputs | Notification records (DE-10); in-app, email, push, SMS messages. |
| Validation | A failed send never fails the action; it is retried and logged (ES-18). Re-running a scheduler job never sends a duplicate (**DR-08**). |
| Permissions | A user is only notified about objects in their scope (BR-09). |
| Dependencies | TEQ channels (dependency D-3). |
| Related business rule | BR-04, BR-09. |

#### FR-097 — Channels, language and deep links
*Implements* BRD §11 ("Messages use the recipient company's language"; push and SMS per company), NFR-06 · MOD-08 · FEAT-43 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Send in-app and email always, push and SMS where the company has enabled them, in the recipient company's language, with a working deep link. |
| Actor | System. |
| Preconditions | Channel enabled for the recipient's company. |
| Main behaviour | SMS is used only for a cancellation when the trip starts within 24 hours (BRD §11). All message text is externalised and translated for nb_NO, en_US, sv_SE and da_DK (NFR-015). Personal data in a message is limited to names the recipient can already see (NFR-020). |
| Inputs | Recipient company settings, locale. |
| Outputs | Channel-specific messages. |
| Validation | AC-NOTIF.1 across all eight events. |
| Permissions | — |
| Dependencies | TEQ email, push and SMS. |
| Related business rule | BR-04, NFR-05, NFR-06. |

#### FR-098 — Notification preferences
*Implements* BRD §14 risk mitigation ("Per-user channel settings and an optional daily summary") · MOD-08 · FEAT-44 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Let a user turn channels off per event — except in-app — and opt into a daily summary email. |
| Actor | All personas (own settings); P-ADMIN sets company defaults. |
| Preconditions | Signed in. |
| Main behaviour | Settings are reachable from the notifications panel (S-10). In-app notification cannot be switched off, so nothing is silently lost. |
| Inputs | Per-event channel toggles; summary opt-in. |
| Outputs | Stored preferences; changed delivery. |
| Validation | — |
| Permissions | Own settings; Admin sets the company default. |
| Dependencies | FR-096. |
| Related business rule | — |

#### FR-099 — Delivery reliability
*Implements* BRD §11 with **DR-09** · MOD-08 · FEAT-43 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Retry failed notifications, log failures, and never duplicate a notification when a job re-runs. |
| Actor | System. |
| Preconditions | A send fails or a job re-runs. |
| Main behaviour | Notifications are written to an outbox in the causing transaction and dispatched afterwards; attempts and outcomes are recorded per recipient and channel (DE-10). |
| Inputs | Outbox entries. |
| Outputs | Deliveries; failure log; monitoring signal (NFR-018). |
| Validation | Idempotency test on scheduler re-runs (**DR-08**). |
| Permissions | — |
| Dependencies | MOD-10. |
| Related business rule | — |

### 6.9 MOD-09 — Access, permissions and visibility

#### FR-100 — Authentication and session
*Implements* NFR-03 ("Users sign in through TEQ's existing login") · MOD-09 · FEAT-45 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Authenticate every user through TEQ's existing login, and resolve their company, role, departments, locale and time zone for the session. |
| Actor | All personas. |
| Preconditions | The user has a TEQ account with BusNetwork access. |
| Main behaviour | The portal holds no separate credential store. When a session expires, the user is returned to TEQ sign-in and then back to the URL they were on; unsent form input is preserved in the browser until re-authentication, and users are advised to save a draft for long forms (**DR-18**, **WA-31**, PQ-23; ES-25). |
| Inputs | TEQ session. |
| Outputs | Authenticated session context. |
| Validation | An expired session never results in a half-applied action (**DR-05**). |
| Permissions | — |
| Dependencies | TEQ login. |
| Related business rule | NFR-03. |

#### FR-101 — Role-based action permission
*Implements* BRD §5 permission matrix · MOD-09 · FEAT-46 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Allow an action only to the roles the BRD permits, on the side of the trip or invoice where it makes sense, and refuse it server-side regardless of the UI. |
| Actor | System. |
| Preconditions | Authenticated session. |
| Main behaviour | The extended matrix below. BRD rows are unchanged; *WA* rows fill gaps the BRD leaves, each with a question. Side always matters: Accept only on received trips, Approve only on incoming invoices. |
| Inputs | Role, action, side. |
| Outputs | Permit or refuse. |
| Validation | Automated authorization tests for every endpoint × role × side (NFR-010). |
| Permissions | — |
| Dependencies | TEQ permission system. |
| Related business rule | BR-09, NFR-03. |

| Action | P-SALES | P-PCOORD | P-FIN | P-ADMIN | P-VIEW | Source |
|---|---|---|---|---|---|---|
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | BRD |
| Create / share request | ✓ | — | — | ✓ | — | BRD |
| Save / resume draft; edit a Requested trip | ✓ | — | — | ✓ | — | from *Create / share* |
| Accept / reject incoming request | — | ✓ | — | ✓ | — | BRD |
| Cancel trip (with reason) | ✓ | ✓ | — | ✓ | — | BRD |
| Mark complete | — | ✓ | — | ✓ | — | WA-05 (PQ-05) |
| Set alternative start address | — | ✓ | — | ✓ | — | WA-19 (PQ-19) |
| Propose / confirm price change (BR-05) | ✓ propose | ✓ confirm | — | ✓ | — | WA-21 (PQ-21) |
| Comment on trip | ✓ | ✓ | ✓ | ✓ | — | BRD |
| Create / edit / submit / delete draft invoice | — | — | ✓ | ✓ | — | WA-04 (PQ-04) |
| Approve / decline invoice | — | — | ✓ | ✓ | — | BRD |
| Download invoice PDF | — | — | ✓ | ✓ | — | WA-04 |
| Export lists | ✓ | ✓ | ✓ | ✓ | ✓ | BRD |
| Configure BusNetwork defaults (reason lists, channels) | — | — | — | ✓ | — | BRD §5 Admin |

#### FR-102 — Company and department scope
*Implements* BR-04, BR-09 · MOD-09 · FEAT-46 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Limit every list, count, badge, export, detail page and notification to trips and invoices of the user's company that fall within the user's departments. |
| Actor | System. |
| Preconditions | Authenticated session with departments resolved. |
| Main behaviour | The scope filter is applied in the query layer for every endpoint, so no surface can bypass it. |
| Inputs | Session scope. |
| Outputs | Scoped results. |
| Validation | AC-SCOPE.1: a user limited to department "West" sees nothing from other departments anywhere. |
| Permissions | — |
| Dependencies | TEQ permissions, BusNetwork Settings. |
| Related business rule | **BR-04**, **BR-09**. |

#### FR-103 — Field-level visibility by viewing company
*Implements* BR-04, NFR-05 · MOD-09 · FEAT-47 · **Must (R1)** · **WA-08, blocking PQ-15**

| Aspect | Detail |
|---|---|
| System must | Remove, server-side, every field the viewing company may not see — from the page, the API response and any export. |
| Actor | System. |
| Preconditions | — |
| Main behaviour | **Host only:** customer price; customer company and billing details; HQ comment; invoice comment; all partners' prices, overrides and responses; the Invoice List *Customer* column. **Both companies:** Trip ID, type, status, schedule, route, alternative start address, PAX, vehicle requirements, shifts, flight no., group ref., sign, contact person name and phone, comment to partner and to driver, invoice reference, attachments, history of trip fields. **A partner, about itself only:** its own offer price, additional costs, response and comment thread with the host. The customer data a partner may see is exactly contact person name and phone, sign, group reference and flight number (**WA-08**, *blocking* **PQ-15**, DPO sign-off). |
| Inputs | Viewing company; trip or invoice. |
| Outputs | Filtered representation. |
| Validation | API tests fetching every object as a partner (AC-DTL-01.2, AC-INV-cust). |
| Permissions | Applies to every role, including Admin of the other company. |
| Dependencies | Data-sharing contract §2. |
| Related business rule | **BR-04**, NFR-05. |

#### FR-104 — Out-of-scope objects return "not found"
*Implements* BR-09 with **DR-03** · MOD-09 · FEAT-46 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Answer a request for a trip or invoice outside the user's company or departments with "not found", so its existence is not revealed, and log the attempt. |
| Actor | System. |
| Preconditions | Object exists but is out of scope, or does not exist. |
| Main behaviour | "Trip not found." / "Invoice not found." — the same message either way (ES-13). |
| Inputs | Object ID. |
| Outputs | Refusal; audit entry. |
| Validation | Identical response for "exists elsewhere" and "does not exist". |
| Permissions | — |
| Dependencies | FR-102. |
| Related business rule | **BR-04**, **BR-09**. |

### 6.10 MOD-10 — Platform services

#### FR-105 — Audit and history entries
*Implements* NFR-04, BN-DTL-05 · MOD-10 · FEAT-48 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Write an entry for every status change, price override, approval and decline — and every edit — with the user (or "System"), company, time and before/after values, in the same transaction as the change, keep it for 5 years, and never allow it to be modified. |
| Actor | System. |
| Preconditions | A recorded change occurs. |
| Main behaviour | Entries are append-only (DE-05) and surfaced on the trip detail history (FR-065), in exports (FR-060) and in an audit export for a trip. Exports themselves are recorded (**DR-12**). |
| Inputs | Change events. |
| Outputs | Audit entries. |
| Validation | AC-AUDIT.1; retention job tested. |
| Permissions | Visible per FR-103; never deletable. |
| Dependencies | — |
| Related business rule | **NFR-04**. |

#### FR-106 — Scheduled jobs
*Implements* BRD §13 *TEQ Scheduler* · MOD-10 · FEAT-49 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Run the jobs the lifecycle depends on: start trips (T5), complete trips (T6), expire requests (T3c), send the 2-hour expiry warning (N-05), and the nightly consistency check. |
| Actor | System. |
| Preconditions | Scheduler available (dependency D-2). |
| Main behaviour | The first four run every minute and act within 5 minutes of the due moment (**DR-07**); the consistency check runs daily at 02:00 CET. All jobs are idempotent (**DR-08**). |
| Inputs | Due trips and deadlines. |
| Outputs | Status changes; notifications; consistency flags. |
| Validation | Monitoring alerts when a job is more than 5 minutes late; transitions catch up on recovery (ES-10). |
| Permissions | System only. |
| Dependencies | TEQ Scheduler. |
| Related business rule | BR-01, BR-07. |

#### FR-107 — Nightly consistency check
*Implements* BRD §14 risk mitigation ("run a nightly check, and flag mismatches on the detail page") · MOD-10 · FEAT-50 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Compare each network trip with its linked TEQ trip every night and flag any difference, without overwriting either side. |
| Actor | System. |
| Preconditions | Trip linked to a TEQ trip. |
| Main behaviour | Differences are recorded as consistency flags (DE-13) with field, both values and the check time, and shown on the detail page (FR-067). A flag is resolved when a later check finds no difference. |
| Inputs | Network trip and TEQ trip records. |
| Outputs | Flags; TM-13 analytics events. |
| Validation | Nothing is auto-corrected (ES-12). |
| Permissions | System; flags visible per FR-103. |
| Dependencies | TEQ Sales / Planning. |
| Related business rule | BR-04. |

#### FR-108 — Behaviour when an integration is unavailable
*Implements* BRD §13 · MOD-10 · FEAT-51 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Fail honestly and specifically when a dependency is down, never half-applying an action. |
| Actor | System. |
| Preconditions | An integration call fails or times out. |
| Main behaviour | Per Appendix D: Bus Network service → error with Retry, nothing half-applied (**DR-05**); TEQ Sales → "TEQ Sales is unavailable — try again", submit blocked if the back-link cannot be written; Company Settings → invoice creation blocked with a specific message while lists still load; BusNetwork Settings → "Partner list unavailable", submit blocked; Google Maps → address fields cannot validate, Next blocked with an explanation, detail shows addresses without a map; Scheduler → monitoring alert, transitions catch up; S3 → upload/download error, trip and invoice data unaffected; notification channels → retries, action unaffected. |
| Inputs | Integration failure. |
| Outputs | Specific message; retry affordance; monitoring signal. |
| Validation | ES-27; no action is left partially applied. |
| Permissions | — |
| Dependencies | All BRD §13 systems. |
| Related business rule | — |

#### FR-109 — Analytics instrumentation
*Implements* OBJ-1…OBJ-5 measurement · MOD-10 · FEAT-52 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Emit the events needed to compute M-1…M-5 (Appendix F), carrying company and role but no personal data. |
| Actor | System. |
| Preconditions | An instrumented action occurs. |
| Main behaviour | Events TM-01…TM-13 with the properties in Appendix F, including `surface = portal | legacy` so M-4 can be computed during coexistence. |
| Inputs | User actions and system transitions. |
| Outputs | Analytics events. |
| Validation | Each metric has a formula and a baseline (Appendix F). |
| Permissions | — |
| Dependencies | Analytics pipeline; support-system tags for M-5 (dependency D-4). |
| Related business rule | NFR-05 (no personal data in events). |

#### FR-110 — Migration mapping and exception reporting
*Implements* BRD §14 assumption and migration risk · MOD-10 · FEAT-53 · **Must (R1)**

| Aspect | Detail |
|---|---|
| System must | Map existing "active"/"archive" trips and existing claims onto the six statuses and the invoice model without losing data, and report anything that does not fit instead of guessing. |
| Actor | Migration team (SH-12). |
| Preconditions | Access to legacy data and its attribute names (dependency D-1). |
| Main behaviour | Mapping tables in Appendix G (**WA-29**, to be validated in the trial run); claims map one-to-one to the four invoice statuses with the legacy reference kept as an alias. Trips or claims that fit no row go into a migration exception report. |
| Inputs | Legacy trip and claim records. |
| Outputs | Migrated records; exception report; reconciliation figures. |
| Validation | Trial migration on a copy of production; trip counts per status and claim totals per company reconcile; Finance sign-off (SUC-6). |
| Permissions | Migration team only. |
| Dependencies | Bus Network service (SH-11). |
| Related business rule | BR-01, BR-06. |

---

## 7. Non-functional requirements

Each product NFR carries a three-digit ID and cites the BRD NFR it implements. Where the BRD sets a number, that number is used unchanged; anything else is marked **`Proposed`** and needs a decision before it becomes a release gate. Areas the BRD does not name explicitly (scalability, reliability, usability, maintainability, logging, data integrity) are derived from BRD text and are marked *derived*.

| ID | Area | Requirement | Source | Acceptance / test method |
|---|---|---|---|---|
| NFR-001 | Performance | A trip or invoice list page loads in under **2 s at the 95th percentile** for a company with 50 000 trips. | NFR-01 | Load test on a seeded company with 50 000 trips and 30 concurrent users mixing filters, sorts and searches; measure server response + first render. |
| NFR-002 | Performance | The dashboard loads in under **3 s**. | NFR-01 | Same harness; p95 over the five figures and all widgets. |
| NFR-003 | Performance | An export of up to 50 000 rows completes within **60 s**. `Proposed` — sized from NFR-01, not stated in the BRD. | NFR-01 (derived) | Export timing test at 10 000 / 50 000 rows; cap enforced per WA-28. |
| NFR-004 | Scalability | The product must hold its performance envelope at **50 000 trips per company** and 30 concurrent users per company. `Proposed` for the concurrency figure. | NFR-01 (derived) | Seeded load test; search index on the five searchable fields (risk RP-4). |
| NFR-005 | Availability | **99.5% monthly uptime**, measured 06:00–22:00 CET. | NFR-02 | Synthetic check every minute against list and detail endpoints in the window; monthly report. |
| NFR-006 | Reliability (timeliness) | Scheduler jobs act within **5 minutes** of the due moment; dashboard data is at most **5 minutes** old. | NFR-02, BN-DSH-08, DR-07 | Job-lateness monitoring; freshness assertion while the dashboard is open (AC-DSH-08.1). |
| NFR-007 | Reliability (integrity of actions) | No action is ever half-applied; every command and scheduled job is idempotent; a double click has one effect. | DR-05, DR-08 (derived from BRD §14 risks) | Fault-injection tests mid-transaction; repeat-submission tests (ES-23); job re-run tests. |
| NFR-008 | Security | Meets the corporate **ISO 27001** baseline. | NFR-03 | Security review against the corporate baseline before GA (SH-15). |
| NFR-009 | Authentication | Users sign in through TEQ's existing login; the portal keeps no separate credential store. | NFR-03 | Authentication integration test; session expiry behaviour (ES-25). |
| NFR-010 | Authorization | Every API call checks the user's company, role, departments and the side of the trip or invoice; the UI is never the only control. | NFR-03, BR-09, DR-02 | Automated authorization matrix tests: every endpoint × role × side × out-of-scope company and department. |
| NFR-011 | Security (content) | Attachments are malware-scanned before they are shared with the other company. | NFR-03, DR-15 | Known-sample scan test; infected file rejected with the ES-16 message. |
| NFR-012 | Usability | Every refusal and validation message names the field or object and what to do next; every empty list states why it is empty and offers a way out. | BN-REQ-10, BN-LST-08 (derived) | Message review against §6 tables (AC-REQ-10.1); empty-state review per screen (§14). |
| NFR-013 | Accessibility | **WCAG 2.1 AA**: full keyboard navigation, visible focus, status conveyed by text and not colour alone; drag-reorder has a keyboard alternative. | NFR-07 | Automated axe checks in CI on every screen; manual keyboard and screen-reader pass (NVDA + VoiceOver) per release; contrast ≥ 4.5:1 text, 3:1 UI (AC-A11Y.1). |
| NFR-014 | Compatibility | The latest two versions of Chrome, Edge, Firefox and Safari; layout works from **1280 px down to 768 px**. | NFR-08 | Cross-browser E2E suite; responsive checks at 1280, 1024 and 768 px; tables scroll horizontally inside their container below 1024 px. |
| NFR-015 | Localisation | Norwegian (nb_NO, default), English (en_US), Swedish (sv_SE), Danish (da_DK); dates and numbers follow the locale; notifications, reason lists and PDFs are localised. | NFR-06 | All strings externalised; pseudo-localisation test for truncation; date/number snapshot tests per locale. |
| NFR-016 | Maintainability | One query builder for all lists and counts, one time-conversion utility, one rounding function, one action matrix, one notification outbox — each behaviour has a single implementation. | NFR-06, BR-07, BR-08 (derived; Architecture AR-02, AR-06) | Architecture review; duplication check in code review; the reconciliation test (AC-ALL-03.1) fails if lists diverge. |
| NFR-017 | Auditability | Every status change, price override, approval and decline is logged with user, time and before/after values, kept **5 years**, and immutable. | NFR-04 | Audit entries written in the same transaction; immutability test; retention job test; audit export for a trip (AC-AUDIT.1). |
| NFR-018 | Logging and monitoring | Scheduler job lateness, notification failures, integration failures and authorization refusals are logged and monitored, with alerts for late jobs. | NFR-02, DR-07, DR-09 (derived) | Alert fires when a job is > 5 minutes late (ES-10); failure log inspected in the pilot. |
| NFR-019 | Data integrity | One stored status per trip with a single writer; Active + Closed = All for any filter; times in UTC; money in integer minor units; a nightly check flags divergence from the TEQ trip without overwriting it. | BR-01, BN-ALL-03, BR-07, BR-08, BRD §14 risk | Property test (every trip in exactly one of Active/Closed and in All); 50-combination reconciliation (AC-ALL-03.1); cross-time-zone tests; nightly-check test. |
| NFR-020 | Privacy | GDPR compliant. Personal data of the host's customer reaches a partner only when needed to run the trip; notifications carry no personal data beyond what the recipient can already see. | NFR-05 | Field-level visibility tests (FR-103); DPIA sign-off on WA-08 (**PQ-15**); notification content review. |

**Coverage of the requested NFR areas:** performance NFR-001…003 · scalability NFR-004 · availability NFR-005 · reliability NFR-006, NFR-007 · security NFR-008, NFR-011 · authentication and authorization NFR-009, NFR-010 · usability NFR-012 · accessibility NFR-013 · compatibility NFR-014 · maintainability NFR-016 · auditability NFR-017 · logging and monitoring NFR-018 · data integrity NFR-019 · privacy NFR-020 · localisation NFR-015.

---

## 8. Product features — catalogue

Priority is the highest MoSCoW value among the feature's BRD requirements; the release slice follows (§15). "Related BR" lists the business requirements from BN-BRD-001 that the feature delivers.

| Feature ID | Feature name | Description | Module | Target persona | Related BR | Related FR | Priority | Dependencies |
|---|---|---|---|---|---|---|---|---|
| FEAT-01 | Six-tab navigation | One fixed-order navigation bar; tabs hidden when the user can't open them; notification bell. | MOD-01 | All | BRD §7, §11 | FR-001, FR-002, FR-006 | Must | MOD-09, TEQ shell |
| FEAT-02 | Action badges | Open-trip count on Active Trips; incoming Pending count on Invoice List. | MOD-01 | P-PCOORD, P-FIN | BRD §7, BN-INV-08 | FR-003, FR-004 | Must | FEAT-18, FEAT-40 |
| FEAT-03 | Deep-linkable routes and URL state | Stable routes; filters, sort and page in the URL; bookmarkable views. | MOD-01 | All | BN-LST-06, BN-LST-10, BN-DSH-02 | FR-005, FR-041 | Must (URL state Should) | FEAT-18 |
| FEAT-04 | Key figures and deep links | Five dashboard figures, each opening the matching filtered list. | MOD-02 | All | BN-DSH-01, BN-DSH-02, BN-INV-08 | FR-007, FR-008 | Must | FEAT-18, FEAT-40, FEAT-35 |
| FEAT-05 | Upcoming trips | Next 10 Accepted / In progress trips by start time, each linked. | MOD-02 | P-SALES, P-PCOORD | BN-DSH-03 | FR-009 | Must | FEAT-23 |
| FEAT-06 | Needs your action | Role-specific list of what is waiting: requests, cancellations, invoices, unread comments; *Recent activity* for read-only roles. | MOD-02 | P-PCOORD, P-FIN, P-SALES, P-VIEW | BN-DSH-04 | FR-010, FR-015 | Must | FEAT-24, FEAT-38, FEAT-46 |
| FEAT-07 | Period selector and network charts | Period switch; weekly shared-vs-received volume; top 5 partners. | MOD-02 | P-VIEW, P-ADMIN | BN-DSH-05, 06, 07 | FR-011, FR-012, FR-013 | Should / Could | FEAT-04 |
| FEAT-08 | Data freshness | Dashboard data ≤ 5 minutes old with "Updated HH:MM", Refresh, and defined widget states. | MOD-02 | All | BN-DSH-08 | FR-014, FR-016 | Must | FEAT-49 |
| FEAT-09 | Four-step request form | Trip details → partners → price → review, with per-step validation and actionable messages. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-01, BN-REQ-10 | FR-017, FR-019, FR-020, FR-021, FR-032 | Must | Maps, TEQ Sales, S3 |
| FEAT-10 | Prefill and entry points | Blank form, prefill from a TEQ trip, or resume a draft; TEQ back-link on submit. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-01, BN-REQ-09 | FR-018, FR-031 | Must | TEQ Sales |
| FEAT-11 | Drafts | Save at any step without validation; resume at that step; 90-day retention. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-02 | FR-022, FR-034 | Should | FEAT-09 |
| FEAT-12 | Partner selection | Picker limited to accepted affiliations with agreement and rate; multi-select. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-03, BN-REQ-04 | FR-023, FR-024 | Must | BusNetwork Settings |
| FEAT-13 | Offer pricing | Per-partner price from the agreement, override with attribution, additional costs, host currency and rounding. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-05, BN-REQ-06 | FR-025, FR-026, FR-027, FR-035 | Must (costs Should) | FEAT-12, Company Settings |
| FEAT-14 | Response deadline | Optional deadline, not after planned start; drives the 2-hour warning and expiry. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-08 | FR-029 | Should *(recommended R1)* | FEAT-32, FEAT-49 |
| FEAT-15 | Submission and share requests | One transaction creating the Requested trip, one share request per partner, back-link and notifications. | MOD-03 | P-SALES, P-ADMIN | BN-REQ-01, 04, 09 | FR-030, FR-031 | Must | FEAT-12, FEAT-13, FEAT-43 |
| FEAT-16 | Edit a requested trip | Host edits while Requested, including adding and removing partners, with history. | MOD-03 | P-SALES, P-ADMIN | BN-ACT-04 (Edit) | FR-033 | Must | FEAT-15, FEAT-25 |
| FEAT-17 | Quick share | One-step share to a default partner at the unmodified agreement price. | MOD-03 | P-SALES | BN-REQ-07 | FR-028 | Could | FEAT-15, BusNetwork Settings |
| FEAT-18 | Shared list component | Paging, search, date range, company filter, sort, formats, empty states, open-and-return, standard columns. | MOD-04 | All | BN-LST-01…05, 07, 08, 10; BRD §8 columns | FR-036…FR-043, FR-045, FR-046 | Must | FEAT-35, FEAT-46 |
| FEAT-19 | List export | CSV/XLSX of all matching rows; All Trips export adds status history. | MOD-04 | All | BN-LST-09, BN-ALL-06 | FR-044, FR-060 | Should | FEAT-18, FEAT-48 |
| FEAT-20 | Active Trips list | Open trips with direction and status filters and the < 24 h flag. | MOD-04 | P-SALES, P-PCOORD | BN-ACT-01, 02, 03, 08 | FR-047, FR-048, FR-049, FR-050 | Must | FEAT-18 |
| FEAT-21 | Closed Trips list | Finished trips with closed-date filter, reasons, invoice status and the not-invoiced quick filter. | MOD-04 | P-FIN, P-PCOORD | BN-CLS-01, 02, 03, 05, 07 | FR-051…FR-055 | Must | FEAT-18, FEAT-40 |
| FEAT-22 | All Trips list | Every status, grouped status filter, reconciling totals, column chooser. | MOD-04 | P-VIEW, P-ADMIN | BN-ALL-01, 02, 03, 05 | FR-056…FR-059 | Must (chooser Could) | FEAT-18, FEAT-35 |
| FEAT-23 | Trip detail page | Full trip view per side, with actions matching the list, route and map, shifts, alternative start address. | MOD-05 | All | BN-DTL-01, 02, 03, 06; BN-LST-10 | FR-061, FR-062, FR-063, FR-066, FR-045 | Must | Maps, FEAT-28, FEAT-47 |
| FEAT-24 | Comment threads | Host↔partner thread with author, company, time, unread state and notification. | MOD-05 | P-SALES, P-PCOORD, P-FIN | BN-DTL-04 | FR-064 | Must | FEAT-43 |
| FEAT-25 | History log | Every status change, price change and edit with actor, time and before/after. | MOD-05 | All | BN-DTL-05 | FR-065 | Must | FEAT-48 |
| FEAT-26 | Consistency flag | Nightly comparison with the TEQ trip surfaced as a flag; nothing overwritten. | MOD-05, MOD-10 | P-SALES, P-PCOORD | BRD §14 risk *(derived)* | FR-067, FR-107 | Must | FEAT-50 |
| FEAT-27 | Post-acceptance price change | Host proposes, partner confirms or declines; recorded as comment and history. | MOD-05 | P-SALES, P-PCOORD | BR-05 | FR-068 | Must | FEAT-24, FEAT-25 |
| FEAT-28 | Action matrix | One matrix of status × side × role driving every surface. | MOD-06 | All acting personas | BN-ACT-04, BN-DTL-06, BN-ALL-04 | FR-069, FR-066 | Must | FEAT-46, FEAT-35 |
| FEAT-29 | Accept and first-accept-wins | Atomic acceptance, automatic withdrawal of other offers, quotation hand-off to TEQ. | MOD-06 | P-PCOORD | BN-ACT-06, BN-ACT-07, BR-03 | FR-070, FR-071, FR-080 | Must | FEAT-43, TEQ Sales |
| FEAT-30 | Reject and cancel with reason | Mandatory reasons from configurable lists, shown to the other company. | MOD-06 | P-PCOORD, P-SALES | BN-ACT-05 | FR-072, FR-073 | Must | FEAT-43 |
| FEAT-31 | Completion | Scheduler moves Accepted → In progress → Completed; partner can mark complete. | MOD-06 | System, P-PCOORD | BRD §7 | FR-074, FR-075 | Must | FEAT-49 |
| FEAT-32 | Expiry | Deadline passes → Rejected "Expired", with a 2-hour warning to the host. | MOD-06 | System | BN-REQ-08, BRD §7 | FR-076 | Should *(recommended R1)* | FEAT-14, FEAT-49 |
| FEAT-33 | Closed immutability | No edits or status changes on closed trips; comments and invoicing only. | MOD-06 | System | BN-CLS-06 | FR-077 | Must | FEAT-28 |
| FEAT-34 | Bulk response | Accept or reject several received requests with one reason; per-trip results. | MOD-06 | P-PCOORD | BN-ACT-09 | FR-078 | Could | FEAT-29, FEAT-30 |
| FEAT-35 | Company-view status | One status per trip per company, derived from that company's share request. | MOD-06 | System | BR-01 + BN-REQ-04 *(WA-01)* | FR-079 | Must | — |
| FEAT-36 | Invoice creation and prefill | Draft from a Completed trip, prefilled with offer price, additional costs and VAT; one active invoice per trip. | MOD-07 | P-FIN | BN-CLS-04, BN-INV-03, BN-INV-04, BR-06 | FR-081, FR-082, FR-083 | Must | FEAT-31, Company Settings |
| FEAT-37 | Invoice lines and totals | Extra lines with validation; line and invoice calculation with standard rounding. | MOD-07 | P-FIN | BN-INV-05 | FR-084, FR-085 | Must | FEAT-36 |
| FEAT-38 | Submit, approve, decline | The settlement decisions, each notifying the other company; decline needs a reason. | MOD-07 | P-FIN | BN-INV-06 | FR-086, FR-087, FR-088 | Must | FEAT-43 |
| FEAT-39 | Versioning after decline | Declined invoice edited and resent as v2, v3…; earlier versions stay read-only. | MOD-07 | P-FIN | BRD §9.6 status table *(WA-11)* | FR-089 | Must | FEAT-38 |
| FEAT-40 | Invoice List and archive | Incoming / Outgoing / Archive sub-tabs, filters, columns, footer totals, draft deletion. | MOD-07 | P-FIN | BN-INV-01, 02, 10 | FR-090, FR-091, FR-094, FR-095 | Must (totals Should) | FEAT-18 |
| FEAT-41 | Amount locking | Lines and totals snapshotted at approval or decline; never recalculated. | MOD-07 | System | BN-INV-07 | FR-092 | Must | FEAT-38 |
| FEAT-42 | Invoice PDF | PDF in the viewing company's language with both companies' details. | MOD-07 | P-FIN | BN-INV-09 | FR-093 | Should | Company Settings, S3 |
| FEAT-43 | Lifecycle notifications | N-01…N-08 to the right recipients on the right channels, after commit, never blocking. | MOD-08 | All | BRD §11 | FR-096, FR-097, FR-099 | Must | TEQ channels |
| FEAT-44 | Notification preferences | Per-event channel toggles (in-app always on) and an optional daily summary. | MOD-08 | All | BRD §14 mitigation | FR-098 | Must | FEAT-43 |
| FEAT-45 | Authentication and session | TEQ sign-in; session context; predictable behaviour on expiry. | MOD-09 | All | NFR-03 | FR-100 | Must | TEQ login |
| FEAT-46 | Role and scope enforcement | Role × side checks and company/department scope in the query layer; "not found" outside scope. | MOD-09 | All | BRD §5, BR-09, NFR-03 | FR-101, FR-102, FR-104 | Must | TEQ permissions |
| FEAT-47 | Cross-company field visibility | Server-side field filtering per viewing company; a partner never receives host-only data. | MOD-09 | All | BR-04, NFR-05 | FR-103 | Must | Data-sharing contract |
| FEAT-48 | Audit trail | Immutable 5-year record of status, price, approval and decline changes with before/after. | MOD-10 | System | NFR-04, BN-DTL-05 | FR-105 | Must | — |
| FEAT-49 | Scheduled jobs | Start, complete, expire, expiry warning, nightly check — idempotent and monitored. | MOD-10 | System | BRD §13 | FR-106 | Must | TEQ Scheduler |
| FEAT-50 | Nightly consistency check | Compare network trip with TEQ trip; flag, never overwrite. | MOD-10 | System | BRD §14 risk | FR-107 | Must | TEQ Sales |
| FEAT-51 | Integration resilience | Specific, honest failure behaviour per dependency; nothing half-applied. | MOD-10 | System | BRD §13 | FR-108 | Must | All integrations |
| FEAT-52 | Analytics instrumentation | TM-01…TM-13 events feeding M-1…M-5. | MOD-10 | System | OBJ-1…OBJ-5 | FR-109 | Must | Analytics pipeline |
| FEAT-53 | Migration tooling | Legacy status and claim mapping, trial reconciliation, exception report. | MOD-10 | SH-12 | BRD §14 *(derived)* | FR-110 | Must | Bus Network service |

---

## 9. User stories and product workflows

Structure: **Module → Epic → Story**. Every story states its persona, preconditions, main and alternative workflows, dependencies, feature and the business rules that constrain it, and points at the acceptance criteria that prove it (§10).

### EP-01 — Portal shell and navigation (MOD-01)

| | |
|---|---|
| **Epic ID** | EP-01 |
| **Objective** | Give every persona one entry point to the whole exchange, showing only what they may open and flagging what is waiting on them. |
| **Related business requirements** | BRD §7, BN-INV-08, BN-LST-06, BN-LST-10, BN-DSH-02 |

**US-001 — Land in the portal**
> As **any BusNetwork user**, I want one navigation bar with the six tabs always in the same order, so that I can reach any part of the exchange without learning a new place each time.

| | |
|---|---|
| Persona | All |
| Preconditions | Signed in through TEQ; company has a linked Bus Network account |
| Main workflow | Open BusNetwork → the bar renders Dashboard · Request · Active Trips · Closed Trips · All Trips · Invoice List → select a tab → its screen opens at its route |
| Alternative workflow | Direct URL entry opens the same screen with the tab marked current |
| Dependencies | FEAT-45 (session) |
| Related feature | FEAT-01 (FR-001) |
| Related business rules | BR-09 |
| Acceptance criteria | AC-NAV-01.1 |

**US-002 — See only the tabs I can use**
> As a **Finance User**, I want tabs I cannot open to be hidden rather than shown as disabled, so that the portal only offers me work I can actually do.

| | |
|---|---|
| Persona | P-FIN (applies to every role) |
| Preconditions | Role and permissions resolved |
| Main workflow | Open the portal → the bar omits tabs the role cannot open (e.g. Request for Finance) |
| Alternative workflow | Navigating straight to a hidden tab's URL returns the standard refusal (FR-104) |
| Dependencies | FEAT-46 |
| Related feature | FEAT-01 (FR-002) |
| Related business rules | BR-09; **WA-02 / PQ-02** |
| Acceptance criteria | AC-NAV-02.1 |

**US-003 — Know what is waiting without opening a tab**
> As a **Partner Coordinator**, I want counts on the Active Trips and Invoice List tabs, so that I can see at a glance that something needs me.

| | |
|---|---|
| Persona | P-PCOORD, P-FIN |
| Preconditions | Trips or invoices exist in the user's scope |
| Main workflow | Open any portal screen → Active Trips shows the open-trip count; Invoice List shows the incoming Pending count → select the tab → the list total matches the badge |
| Alternative workflow | Zero renders as no badge |
| Dependencies | FEAT-18, FEAT-40 |
| Related feature | FEAT-02 (FR-003, FR-004) |
| Related business rules | BR-01, BR-09 |
| Acceptance criteria | AC-NAV-03.1, AC-INV-08.1 |

**US-004 — Share a filtered view**
> As a **Sales user**, I want a filtered list to live at its own URL, so that I can bookmark it or send it to a colleague and see the same thing.

| | |
|---|---|
| Persona | P-SALES (all roles) |
| Preconditions | A list with filters, sort and page applied |
| Main workflow | Apply filters → the URL updates → copy it → open it in a new session → the identical view appears |
| Alternative workflow | A recipient without rights to a filter value sees the view with that value dropped and a "Some filters were removed" notice (ES-14) |
| Dependencies | FEAT-18 |
| Related feature | FEAT-03 (FR-005, FR-041) |
| Related business rules | BR-07, BR-09 |
| Acceptance criteria | AC-LST-06.1 |

### EP-02 — Dashboard (MOD-02)

| | |
|---|---|
| **Epic ID** | EP-02 |
| **Objective** | Answer, in order, what needs my action now, what is running soon, and how the network is doing — for the signed-in user's role and scope. |
| **Related business requirements** | BN-DSH-01…BN-DSH-08 |

**US-005 — See the five key figures**
> As **any user**, I want five figures summarising requests, active trips, upcoming starts, closed trips and open invoices, so that I know the state of my company's network in one look.

| | |
|---|---|
| Persona | All |
| Preconditions | Dashboard open |
| Main workflow | Open Dashboard → the five tiles render for the user's company and departments, each with value, label and sub-line |
| Alternative workflow | Zero renders as "0"; a failed tile shows its own error with Retry (FR-016) |
| Dependencies | FEAT-35, FEAT-40 |
| Related feature | FEAT-04 (FR-007) |
| Related business rules | BR-04, BR-09; **WA-03 / PQ-03**, **WA-13 / PQ-16** |
| Acceptance criteria | AC-DSH-01.1 |

**US-006 — Go from a figure to the trips behind it**
> As **any user**, I want to select a figure and land on the list it counts, so that I can act on those trips immediately.

| | |
|---|---|
| Persona | All |
| Preconditions | Figures rendered |
| Main workflow | Select "Awaiting response" → Active Trips opens filtered to Requested + received, with the filters visible as chips and in the URL |
| Alternative workflow | If the target list is hidden for the role, the figure is not a link |
| Dependencies | FEAT-18, FEAT-03 |
| Related feature | FEAT-04 (FR-008) |
| Related business rules | BR-01 |
| Acceptance criteria | AC-DSH-02.1 |

**US-007 — See what is running soon**
> As a **Sales user**, I want the next 10 trips by start time, so that I can spot anything that still needs attention before it starts.

| | |
|---|---|
| Persona | P-SALES, P-PCOORD |
| Preconditions | Accepted or In progress trips exist |
| Main workflow | Open Dashboard → *Upcoming trips* lists up to 10 rows sorted by start → select a row → trip detail |
| Alternative workflow | None exist → "No upcoming trips" |
| Dependencies | FEAT-23 |
| Related feature | FEAT-05 (FR-009) |
| Related business rules | BR-04, BR-09 |
| Acceptance criteria | AC-DSH-03.1 |

**US-008 — Work my queue from the dashboard**
> As a **Partner Coordinator**, I want a list of items waiting on me with their deadlines, so that I answer requests before they expire.

| | |
|---|---|
| Persona | P-PCOORD |
| Preconditions | Items exist for the user's role |
| Main workflow | Open Dashboard → *Needs your action* groups incoming requests, cancellations and unread comments with counts → select an item → the trip opens → act → the item disappears |
| Alternative workflow | Nothing waiting → "Nothing waiting on you" |
| Dependencies | FEAT-28, FEAT-24 |
| Related feature | FEAT-06 (FR-010) |
| Related business rules | BR-09; **WA-15** |
| Acceptance criteria | AC-DSH-04.1 |

**US-009 — See invoices waiting for my decision**
> As a **Finance User**, I want incoming Pending invoices in my action list and in the *Open invoices* figure, so that nothing sits unapproved.

| | |
|---|---|
| Persona | P-FIN |
| Preconditions | Incoming Pending invoices exist |
| Main workflow | Open Dashboard → invoices appear first in *Needs your action* → select one → invoice opens → approve or decline → the item clears and the figure and badge drop |
| Alternative workflow | — |
| Dependencies | FEAT-38 |
| Related feature | FEAT-06, FEAT-04 (FR-010, FR-007) |
| Related business rules | BR-04 |
| Acceptance criteria | AC-DSH-04.2, AC-INV-08.1 |

**US-010 — Compare periods and volumes**
> As **Management**, I want to switch the period and see weekly shared-versus-received volume, so that I can judge how much work moves through the network.

| | |
|---|---|
| Persona | P-VIEW, P-ADMIN |
| Preconditions | Historic data exists |
| Main workflow | Choose This week / This month / Last 30 days / Custom → the period figure and charts recalculate and relabel → read the 12-week volume chart, or its table view |
| Alternative workflow | Custom From after To is refused inline |
| Dependencies | FEAT-04 |
| Related feature | FEAT-07 (FR-011, FR-012) |
| Related business rules | BR-07; **WA-14 / PQ-14** |
| Acceptance criteria | AC-DSH-05.1, AC-DSH-06.1 |

**US-011 — See who we work with most**
> As **Management**, I want the top 5 partner companies by completed trips in the period, so that I can see where the volume actually goes.

| | |
|---|---|
| Persona | P-VIEW, P-ADMIN |
| Preconditions | Completed trips in the period |
| Main workflow | Open Dashboard → *Top partners* lists 5 companies with counts, descending |
| Alternative workflow | Whether names are shown is **Q7**; until decided, names are shown |
| Dependencies | FEAT-07 |
| Related feature | FEAT-07 (FR-013) |
| Related business rules | BR-04; **Q7** |
| Acceptance criteria | AC-DSH-07.1 |

**US-012 — Trust what the dashboard says**
> As **any user**, I want to know how fresh the figures are, so that I can tell whether what I see is current.

| | |
|---|---|
| Persona | All |
| Preconditions | Dashboard open |
| Main workflow | Read "Updated HH:MM" → use Refresh → figures update; my own action is reflected immediately |
| Alternative workflow | Data older than 5 minutes is never shown while the page is open |
| Dependencies | FEAT-49 |
| Related feature | FEAT-08 (FR-014) |
| Related business rules | BR-07 |
| Acceptance criteria | AC-DSH-08.1 |

**US-013 — Monitor without being offered actions**
> As **Management with read-only access**, I want recent activity instead of an action list, so that the dashboard never offers me something I cannot do.

| | |
|---|---|
| Persona | P-VIEW |
| Preconditions | Role has no action rights |
| Main workflow | Open Dashboard → *Recent activity* lists the latest status changes with links; no action buttons anywhere |
| Alternative workflow | — |
| Dependencies | FEAT-48 |
| Related feature | FEAT-06 (FR-015) |
| Related business rules | BR-04, BR-09 |
| Acceptance criteria | AC-DSH-04.3 |

### EP-03 — Request and share a trip (MOD-03)

| | |
|---|---|
| **Epic ID** | EP-03 |
| **Objective** | Let a host user turn a trip they cannot run into a request that one or more partners can answer, at a price taken from each agreement — in one form (OBJ-1). |
| **Related business requirements** | BN-REQ-01…BN-REQ-10, BN-ACT-04 (Edit), BR-02, BR-08 |

**US-014 — Create a request in four steps**
> As a **Sales user**, I want to create a trip and share it through four clear steps, so that I can hand work to a partner without hunting through screens.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Holds *Create / share request*; at least one accepted affiliation |
| Main workflow | Request tab → step 1 trip details → Next → step 2 partners → Next → step 3 prices → Next → step 4 review → **Submit request** |
| Alternative workflow | Go back to any completed step without losing input; Save draft at any step (US-016); a validation failure keeps the user on the step with messages (US-023) |
| Dependencies | Google Maps, TEQ Sales, BusNetwork Settings |
| Related feature | FEAT-09 (FR-017, FR-019, FR-021) |
| Related business rules | BR-02, BR-07, BR-08 |
| Acceptance criteria | AC-REQ-01.1, AC-REQ-01.2 |

**US-015 — Share a trip I already have in TEQ**
> As a **Sales user**, I want to share an existing TEQ trip and find the form already filled in, so that I do not retype what TEQ already knows.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | A TEQ normal or fixed trip visible to the user |
| Main workflow | *Sales › Network Trips* → **Share** → the request form opens prefilled with type, customer, route, times, PAX and vehicle requirements, with a banner naming the source trip → continue as US-014 |
| Alternative workflow | TEQ Sales unavailable → "TEQ Sales is unavailable — try again" (ES-27); the trip is already shared → ES-32 (**WA-30 / PQ-22**) |
| Dependencies | TEQ Sales / Planning |
| Related feature | FEAT-10 (FR-018) |
| Related business rules | BR-09 |
| Acceptance criteria | AC-REQ-01.3 |

**US-016 — Pick a request up later**
> As a **Sales user**, I want to save a half-finished request and come back to it, so that an interruption does not cost me the work.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Request form open |
| Main workflow | **Save draft** at any step → the draft appears under "My drafts" on the Request tab → open it tomorrow → it resumes at the saved step with the same data |
| Alternative workflow | Unused for 90 days → warned at 83 days, then deleted (**WA-18 / PQ-18**) |
| Dependencies | — |
| Related feature | FEAT-11 (FR-022, FR-034) |
| Related business rules | BR-01 (a draft is not a trip), BR-04 |
| Acceptance criteria | AC-REQ-02.1 |

**US-017 — Choose the right partners**
> As a **Sales user**, I want to see only companies we have an accepted partnership with, together with their agreement and rate, so that I choose a partner who can actually be offered this trip.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Step 1 valid |
| Main workflow | Step 2 → search or sort the partner table → tick one or more partners → the selected count updates → Next |
| Alternative workflow | No accepted partners → "No accepted partners yet. Partnerships are set up in BusNetwork Settings." (ES-31); an affiliation ends between steps → submit refused (ES-09) |
| Dependencies | BusNetwork Settings |
| Related feature | FEAT-12 (FR-023, FR-024) |
| Related business rules | **BR-02** |
| Acceptance criteria | AC-REQ-03.1, AC-REQ-04.1 |

**US-018 — See what each partner will be offered**
> As a **Sales user**, I want each partner's offer price calculated from its own agreement, so that I do not have to work out percentages or day rates by hand.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Partners selected; customer price known for percentage agreements |
| Main workflow | Step 3 → enter or confirm the customer price → each partner row shows its agreement and calculated offer price, rounded to 2 decimals in the host currency |
| Alternative workflow | Percentage with no customer price → "Enter a customer price to calculate", Next blocked (ES-24); no agreement → price 0 and a price must be entered (ES-08) |
| Dependencies | BusNetwork Settings, TEQ Company Settings |
| Related feature | FEAT-13 (FR-025, FR-035) |
| Related business rules | **BR-08**; **WA-17 / PQ-13** |
| Acceptance criteria | AC-REQ-05.1, AC-REQ-05.3 |

**US-019 — Override a price when the situation demands it**
> As a **Sales user**, I want to change a calculated offer price and have the change attributed to me, so that an exception is possible but never anonymous.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Step 3 open; trip not yet accepted |
| Main workflow | Edit the offer price → the row shows calculated and overridden values with my name and a Reset → submit → history records both values, user and time |
| Alternative workflow | After acceptance, price changes go through propose/confirm instead (US-043, BR-05) |
| Dependencies | FEAT-48 |
| Related feature | FEAT-13 (FR-026) |
| Related business rules | BR-05, BR-08, NFR-04 |
| Acceptance criteria | AC-REQ-05.2 |

**US-020 — Add a cost that is not part of the rate**
> As a **Sales user**, I want to add costs such as ferries or tolls per partner, so that the partner sees the full offer and can bill it later.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Partner selected on step 3 |
| Main workflow | **+ Add cost** → description and amount → the line shows separately from the offer price → it is visible to that partner only and prefills that partner's invoice |
| Alternative workflow | — |
| Dependencies | FEAT-36 |
| Related feature | FEAT-13 (FR-027) |
| Related business rules | BR-04, BR-08 |
| Acceptance criteria | AC-REQ-06.1 |

**US-021 — Put a clock on the request**
> As a **Sales user**, I want to set a response deadline, so that an unanswered request closes itself instead of sitting open.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Step 3 open |
| Main workflow | Set a deadline in the future and not after the planned start → partners see it on the request and in their notification → at the deadline with no acceptance the trip becomes Rejected · "Expired" and I am notified |
| Alternative workflow | No deadline set → it defaults to the planned start (**WA-10 / PQ-10**, **Q6**); a deadline after planned start is refused |
| Dependencies | FEAT-32, FEAT-49 |
| Related feature | FEAT-14 (FR-029) |
| Related business rules | BR-07; OBJ-2 |
| Acceptance criteria | AC-REQ-08.1, AC-REQ-08.2 |

**US-022 — Know the request went out**
> As a **Sales user**, I want a confirmation with the Trip ID and a link, and the TEQ trip marked as shared, so that both systems agree about what I just did.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | All steps valid; partners still affiliated; every offer price > 0 |
| Main workflow | **Submit request** → trip created as Requested with one share request per partner → success screen "Request sent to 2 partners. Trip ID 48213." with **Open in Active Trips** → the TEQ trip shows "Shared via BusNetwork · 48213" |
| Alternative workflow | Double click submits once (ES-23); the back-link cannot be written → submit refused (ES-28); an affiliation ended → ES-09 |
| Dependencies | Bus Network service, TEQ Sales, FEAT-43 |
| Related feature | FEAT-15 (FR-030, FR-031) |
| Related business rules | **BR-02**, BR-01 |
| Acceptance criteria | AC-REQ-09.1 |

**US-023 — Understand exactly what is wrong**
> As a **Sales user**, I want every error to name the field and how to fix it, so that I can correct it without guessing.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | A validation rule fails |
| Main workflow | Press Next → an error summary lists each problem with a link to the field → inline messages say what to do, e.g. "End time must be after start time (start 2026-09-20 08:00)." |
| Alternative workflow | The same wording is returned by the API for scripted clients |
| Dependencies | NFR-013, NFR-015 |
| Related feature | FEAT-09 (FR-032) |
| Related business rules | — |
| Acceptance criteria | AC-REQ-10.1 |

**US-024 — Correct a request that is already out**
> As a **Sales user**, I want to edit a Requested trip, including who it went to, so that a late change does not force me to cancel and start again.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Trip status Requested; host side |
| Main workflow | Active Trips → **Edit** → the form opens with current values → change details or partners → submit → history records each change; added partners get a new request and notification; removed partners' requests are withdrawn |
| Alternative workflow | A partner accepting at the same moment is resolved by ES-04, showing "Details changed — review before accepting" |
| Dependencies | FEAT-15, FEAT-43 |
| Related feature | FEAT-16 (FR-033) |
| Related business rules | BR-02; **WA-06 / PQ-06** |
| Acceptance criteria | AC-ACT-04.2 |

**US-025 — Share in one step when it is always the same partner**
> As a **Sales user with a regular partner**, I want to share straight after the trip details, so that routine work takes one step instead of four.

| | |
|---|---|
| Persona | P-SALES |
| Preconditions | A default partner with an accepted affiliation and an agreement other than *none* |
| Main workflow | Step 1 → **Quick share** → the trip is Requested to that partner at the unmodified agreement price |
| Alternative workflow | Default partner has no agreement → Quick share unavailable |
| Dependencies | BusNetwork Settings |
| Related feature | FEAT-17 (FR-028) |
| Related business rules | BR-02, BR-08 |
| Acceptance criteria | AC-REQ-07.1 |

**US-026 — Attach the paperwork**
> As a **Sales user**, I want to attach up to two documents to the trip, so that the partner has what they need to run it.

| | |
|---|---|
| Persona | P-SALES, P-ADMIN |
| Preconditions | Step 1 open |
| Main workflow | Drop or pick a file → it uploads, is scanned, and is listed with name, size and uploader → the partner can download it |
| Alternative workflow | Wrong type, too large, a third file, or a failed scan → the specific message in ES-16 |
| Dependencies | S3, NFR-011 |
| Related feature | FEAT-09 (FR-020) |
| Related business rules | BR-04 |
| Acceptance criteria | AC-REQ-01.4 |

### EP-04 — Find and track trips (MOD-04)

| | |
|---|---|
| **Epic ID** | EP-04 |
| **Objective** | Make every trip findable in exactly one open list, one closed list and one complete list that always reconcile (OBJ-5). |
| **Related business requirements** | BN-LST-01…10, BN-ACT-01…03, 08, BN-CLS-01…03, 05, 07, BN-ALL-01…03, 05, 06 |

**US-027 — Find a trip fast**
> As **any user**, I want to search, filter, sort and page through trips, so that I can find a specific trip or a set of trips in seconds.

| | |
|---|---|
| Persona | All |
| Preconditions | A trip list is open |
| Main workflow | Type in the search box (Trip ID, address, company, group ref.) → narrow by trip-start range and company → sort by a column → page through results with the total shown |
| Alternative workflow | From after To → inline error, list unchanged (ES-29 boundary cases); no match → explained empty state with **Clear filters** (US-036) |
| Dependencies | FEAT-46 (scope) |
| Related feature | FEAT-18 (FR-036…FR-042) |
| Related business rules | BR-04, **BR-07**, BR-09 |
| Acceptance criteria | AC-LST-01.1, AC-LST-01.2, AC-LST-02.1, AC-LST-03.1, AC-LST-03.2, AC-LST-04.1, AC-LST-05.1, AC-LST-07.1 |

**US-028 — Take the list away**
> As **Management**, I want to export exactly what I am looking at, so that I can report on it outside the portal.

| | |
|---|---|
| Persona | All (export is allowed for every role) |
| Preconditions | A list with any filter state |
| Main workflow | **Export ▾** → CSV or XLSX → the file contains every matching row, not just the page, with the visible columns and the time zone named in the header |
| Alternative workflow | More than 50 000 rows → refused before starting with advice to narrow the filters (ES-21); All Trips export adds the status history (US-033) |
| Dependencies | FEAT-48 (export is audited) |
| Related feature | FEAT-19 (FR-044, FR-060) |
| Related business rules | BR-04, BR-09 |
| Acceptance criteria | AC-LST-09.1, AC-ALL-06.1 |

**US-029 — Work the open trips**
> As a **Partner Coordinator**, I want Active Trips to show only open trips, filtered by whether we shared or received them and by status, so that my working list is exactly my work.

| | |
|---|---|
| Persona | P-PCOORD, P-SALES |
| Preconditions | Active Trips visible |
| Main workflow | Open Active Trips → choose direction (All / Shared by us / Received by us) → choose one or more of Requested, Accepted, In progress → act on rows with the buttons the status and role allow |
| Alternative workflow | Own action moves a row out of the list with a toast "Trip 48213 moved to Closed Trips" and a link (ES-15) |
| Dependencies | FEAT-28, FEAT-35 |
| Related feature | FEAT-20 (FR-047, FR-048, FR-049) |
| Related business rules | **BR-01** |
| Acceptance criteria | AC-ACT-01.1, AC-ACT-02.1, AC-ACT-03.1 |

**US-030 — Spot what starts very soon**
> As a **Sales user**, I want Requested trips starting within 24 hours flagged, so that I can chase a partner or take the trip back before it is too late.

| | |
|---|---|
| Persona | P-SALES, P-PCOORD |
| Preconditions | A Requested trip starting within 24 h |
| Main workflow | Open Active Trips → the row shows "⏱ Starts < 24 h" beside the status, in text and icon, not colour alone |
| Alternative workflow | The flag appears or disappears as the trip crosses the mark, without a reload |
| Dependencies | FEAT-18 |
| Related feature | FEAT-20 (FR-050) |
| Related business rules | BR-07, NFR-07 |
| Acceptance criteria | AC-ACT-08.1 |

**US-031 — Review what has finished**
> As a **Finance User**, I want Closed Trips to show finished trips with why they closed and their invoice status, so that I can see what still needs settling.

| | |
|---|---|
| Persona | P-FIN, P-PCOORD |
| Preconditions | Closed Trips visible |
| Main workflow | Open Closed Trips → filter by status, direction and closed-date range → read the reason (shortened, full on hover or focus) and the invoice status → open the invoice or the trip |
| Alternative workflow | Cancelled and Rejected trips show "—" in the Invoice column because they can never be invoiced |
| Dependencies | FEAT-40 |
| Related feature | FEAT-21 (FR-051…FR-054) |
| Related business rules | **BR-06**, BR-07 |
| Acceptance criteria | AC-CLS-01.1, AC-CLS-02.1, AC-CLS-03.1, AC-CLS-05.1 |

**US-032 — Find what still needs billing**
> As a **Finance User**, I want a one-click filter for Completed trips we have not invoiced, so that nothing we ran goes unbilled.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN |
| Preconditions | Closed Trips open |
| Main workflow | Select the chip **Completed, not invoiced** → the list shows Completed trips we received with no invoice other than Declined ones → **Create invoice** on a row |
| Alternative workflow | A trip whose only invoices are Declined is included, because it still needs billing (**WA-22**) |
| Dependencies | FEAT-36 |
| Related feature | FEAT-21 (FR-055) |
| Related business rules | BR-06 |
| Acceptance criteria | AC-CLS-07.1 |

**US-033 — Search everything and trust the totals**
> As **Management**, I want one list with all six statuses whose counts add up to the other two lists, so that I can report without reconciling by hand.

| | |
|---|---|
| Persona | P-VIEW, P-ADMIN |
| Preconditions | All Trips visible |
| Main workflow | Open All Trips → tick the "Closed" group heading to select its three statuses → read the count line "412 trips (Active 37 · Closed 375)" → export with status history |
| Alternative workflow | For identical filters, `count(All) = count(Active) + count(Closed)` always holds |
| Dependencies | FEAT-35 |
| Related feature | FEAT-22 (FR-056, FR-057, FR-058), FEAT-19 (FR-060) |
| Related business rules | **BR-01**, BR-09 |
| Acceptance criteria | AC-ALL-01.1, AC-ALL-02.1, AC-ALL-03.1, AC-ALL-06.1 |

**US-034 — Show only the columns I use**
> As **any user**, I want to hide columns I never read, so that the list fits my screen and my job.

| | |
|---|---|
| Persona | All |
| Preconditions | All Trips open |
| Main workflow | **Columns** → untick PAX and Shift → the choice persists for me on any device |
| Alternative workflow | Trip ID and Status cannot be hidden |
| Dependencies | — |
| Related feature | FEAT-22 (FR-059) |
| Related business rules | — |
| Acceptance criteria | AC-ALL-05.1 |

**US-035 — Come back to where I was**
> As **any user**, I want the list to be exactly as I left it after opening a trip, so that I can work through a list without losing my place.

| | |
|---|---|
| Persona | All |
| Preconditions | A filtered, sorted, scrolled list |
| Main workflow | Select a row → trip detail → **Back to list** or browser Back → filters, sort, page and scroll position are restored |
| Alternative workflow | Opening a trip outside scope returns "Trip not found." (ES-13) |
| Dependencies | FEAT-03 |
| Related feature | FEAT-18 (FR-045) |
| Related business rules | BR-09 |
| Acceptance criteria | AC-LST-10.1 |

**US-036 — Understand an empty list**
> As **any user**, I want an empty list to tell me why it is empty and offer a way out, so that I do not think the portal has lost my trips.

| | |
|---|---|
| Persona | All |
| Preconditions | Zero matching rows |
| Main workflow | Filters match nothing → "No active trips match these filters." with **Clear filters** → clearing restores results |
| Alternative workflow | Nothing exists yet → "No active trips right now." with "Create a request" for roles that may create one |
| Dependencies | — |
| Related feature | FEAT-18 (FR-043) |
| Related business rules | — |
| Acceptance criteria | AC-LST-08.1 |

### EP-05 — Trip detail and collaboration (MOD-05)

| | |
|---|---|
| **Epic ID** | EP-05 |
| **Objective** | One page that shows a trip completely to each side, carries the conversation between the two companies, and records what happened. |
| **Related business requirements** | BN-DTL-01…BN-DTL-06, BR-04, BR-05, BRD §14 risk |

**US-037 — See the whole trip on one page**
> As **any user on a trip**, I want one page with route, schedule, passengers, pricing, attachments and comments, so that I never have to assemble a trip from several screens.

| | |
|---|---|
| Persona | All |
| Preconditions | The trip is in the user's company and department scope |
| Main workflow | Open a trip from any list or notification → header with Trip ID, status and actions → route with map → schedule → PAX and vehicle → shifts for fixed trips → pricing → attachments → comment fields → side panel with status, partner responses, invoice and comment thread |
| Alternative workflow | Out of scope → "Trip not found." (ES-13); a section whose dependency is down renders without it (for example addresses without a map, ES-27) |
| Dependencies | Google Maps, S3, FEAT-47 |
| Related feature | FEAT-23 (FR-061, FR-063, FR-066) |
| Related business rules | **BR-04**, BR-01 |
| Acceptance criteria | AC-DTL-01.1, AC-DTL-03.1, AC-DTL-06.1 |

**US-038 — Correct the pickup point**
> As a **Partner Coordinator on an accepted trip**, I want to set an alternative start address, so that everyone sees where the bus will actually start.

| | |
|---|---|
| Persona | P-PCOORD, P-ADMIN of the accepted partner |
| Preconditions | This company's share request is `ACCEPTED`; the trip has not started |
| Main workflow | Trip detail → set alternative start address → it resolves on the map → it replaces the original start address in detail, lists and exports, with "Original: …" available → the change is written to history |
| Alternative workflow | Address does not resolve → ES-17; trip already In progress or closed → the action is not offered and the API refuses |
| Dependencies | Google Maps, FEAT-48 |
| Related feature | FEAT-23 (FR-062) |
| Related business rules | BR-04; **WA-19 / PQ-19** |
| Acceptance criteria | AC-DTL-02.1 |

**US-039 — Talk to the other company about the trip**
> As a **Partner Coordinator**, I want a comment thread with the host on the trip itself, so that questions and answers stay attached to the work they are about.

| | |
|---|---|
| Persona | P-SALES, P-PCOORD, P-FIN, P-ADMIN |
| Preconditions | Holds *Comment on trip*; the trip is in scope (closed trips included) |
| Main workflow | Trip detail → write a comment → it appears with author, company and time → the other company's users on the trip get an in-app notification and an unread marker on the list row |
| Alternative workflow | A partner sees only its own thread with the host, never another partner's; a posted comment cannot be edited or deleted (**WA-20 / PQ-20**) |
| Dependencies | FEAT-43 |
| Related feature | FEAT-24 (FR-064) |
| Related business rules | **BR-04**, NFR-04 |
| Acceptance criteria | AC-DTL-04.1 |

**US-040 — See what happened and who did it**
> As a **Company Admin**, I want a log of every status change, price change and edit with the person and time, so that I can settle a disagreement with facts.

| | |
|---|---|
| Persona | All (with field visibility applied) |
| Preconditions | Trip in scope |
| Main workflow | Trip detail → History → newest first with actor (or "System"), company, time and before → after → filter by Status, Price or Edits |
| Alternative workflow | A partner sees only entries about the trip and its own request — never other partners' prices or responses |
| Dependencies | FEAT-48 |
| Related feature | FEAT-25 (FR-065) |
| Related business rules | **BR-04**, NFR-04 |
| Acceptance criteria | AC-DTL-05.1, AC-AUDIT.1 |

**US-041 — Be warned when the two copies of a trip disagree**
> As a **Sales user**, I want to be told when the network trip differs from the TEQ trip, so that I can fix it before the partner drives to the wrong place.

| | |
|---|---|
| Persona | P-SALES, P-PCOORD |
| Preconditions | The nightly check found a difference |
| Main workflow | Open the trip → a banner names the field and both values with the check time → correct the source data |
| Alternative workflow | Nothing is overwritten automatically; a partner sees the flag only for fields it may see (ES-12) |
| Dependencies | FEAT-50 |
| Related feature | FEAT-26 (FR-067) |
| Related business rules | BR-04 |
| Acceptance criteria | AC-CONS-01.1 |

**US-042 — Agree a new price after acceptance**
> As a **Sales user**, I want to propose a price change that the partner must confirm, so that a price never moves without both companies agreeing.

| | |
|---|---|
| Persona | P-SALES / P-ADMIN propose; P-PCOORD / P-ADMIN confirm |
| Preconditions | Trip Accepted or In progress; a partner has accepted |
| Main workflow | Trip detail → **Propose price change** → new price and a required comment → the partner sees Confirm / Decline → on Confirm the offer price changes; proposal and answer are posted as comments and written to history |
| Alternative workflow | On Decline the price is unchanged and both companies see the exchange; the price field is not editable by any other route |
| Dependencies | FEAT-24, FEAT-48 |
| Related feature | FEAT-27 (FR-068) |
| Related business rules | **BR-05**, BR-08, NFR-04; **WA-21 / PQ-21** |
| Acceptance criteria | AC-BR05.1 |

### EP-06 — Trip lifecycle and responses (MOD-06)

| | |
|---|---|
| **Epic ID** | EP-06 |
| **Objective** | Move every trip through one defined lifecycle, with the right people able to act at the right moment, so that the status always tells the truth (BR-01, OBJ-1, OBJ-2). |
| **Related business requirements** | BRD §7, BN-ACT-04…07, 09, BN-DTL-06, BN-ALL-04, BN-CLS-06, BN-REQ-08, BR-01, BR-03 |

**US-043 — Accept a request**
> As a **Partner Coordinator**, I want to accept a received request in a couple of clicks, so that the host knows immediately that the trip is covered.

| | |
|---|---|
| Persona | P-PCOORD, P-ADMIN |
| Preconditions | Trip Requested; our share request `PENDING`; deadline not passed |
| Main workflow | Dashboard or Active Trips → open the trip → **Accept** → dialog shows offer price, additional costs, start and route, and warns that other partners' offers will be withdrawn → confirm → status Accepted → host notified → **Create quotation in TEQ** offered |
| Alternative workflow | Another partner got there first → "Already taken — another partner accepted this trip." (ES-01); deadline passed → ES-02; host cancelled or removed us → ES-03; host edited meanwhile → "Details changed — review before accepting" (ES-04) |
| Dependencies | FEAT-43, TEQ Sales |
| Related feature | FEAT-29 (FR-070, FR-080) |
| Related business rules | **BR-03**, BR-01 |
| Acceptance criteria | AC-ACT-06.1, AC-ACT-07.2 |

**US-044 — Be told when an offer is no longer mine to take**
> As a **Partner Coordinator who was not first**, I want to be told that the trip went to someone else, so that I stop planning for it.

| | |
|---|---|
| Persona | P-PCOORD, P-ADMIN of the other partners |
| Preconditions | Another partner accepted |
| Main workflow | Our share request becomes `WITHDRAWN` → in-app notification "Trip 48213 is no longer available — another partner accepted it." → the trip shows for us as **Cancelled · Another partner accepted** |
| Alternative workflow | If our page was open, the row and detail update on the next refresh (ES-15) |
| Dependencies | FEAT-35, FEAT-43 |
| Related feature | FEAT-29 (FR-071) |
| Related business rules | **BR-03**, BR-01; **WA-01 / PQ-01** |
| Acceptance criteria | AC-ACT-07.1 |

**US-045 — Reject with a reason**
> As a **Partner Coordinator**, I want to reject a request with a reason the host can read, so that they can re-share it quickly and know why.

| | |
|---|---|
| Persona | P-PCOORD, P-ADMIN |
| Preconditions | Our share request `PENDING` |
| Main workflow | **Reject** → choose a reason or *Other* with free text → confirm → we see the trip as Rejected with our reason → toast "Trip 48213 rejected. It's now in Closed Trips." |
| Alternative workflow | The host still sees Requested while another partner is pending; when the last one rejects, the trip becomes Rejected and the host is notified |
| Dependencies | FEAT-43 |
| Related feature | FEAT-30 (FR-072) |
| Related business rules | BR-01, BR-04; **WA-07 / PQ-07** |
| Acceptance criteria | AC-ACT-05.1 |

**US-046 — Cancel a trip with a reason**
> As a **Sales user**, I want to cancel a trip the customer has cancelled, giving a reason, so that the partner is told at once and stops planning for it.

| | |
|---|---|
| Persona | P-SALES, P-PCOORD, P-ADMIN |
| Preconditions | Status Requested or Accepted; a partner may cancel only if its request is `ACCEPTED` |
| Main workflow | **Cancel** → reason required (warning shown when SMS will be sent because the trip starts within 24 h) → confirm → status Cancelled → the trip moves to Closed Trips → the other company is notified in-app and by email, plus SMS if start < 24 h |
| Alternative workflow | In progress trips cannot be cancelled (**PQ-08**, ES-05); a closed trip cannot be changed (ES-06) |
| Dependencies | FEAT-43 |
| Related feature | FEAT-30 (FR-073) |
| Related business rules | BR-01, BR-04 |
| Acceptance criteria | AC-ACT-05.1, AC-ACT-05.2 |

**US-047 — Mark a trip complete when it is done**
> As a **Partner Coordinator**, I want to mark an In progress trip complete, so that it can be invoiced without waiting for the planned end time.

| | |
|---|---|
| Persona | P-PCOORD, P-ADMIN |
| Preconditions | Status In progress; we are the accepted partner |
| Main workflow | **Mark complete** → confirmation "It moves to Closed Trips and can be invoiced." → status Completed, `closed_at` set → the trip appears in Closed Trips with Invoice = "Not invoiced" |
| Alternative workflow | The scheduler completes it automatically at the planned end if nobody does (US-048); whether completion should be automatic at all is **Q5** |
| Dependencies | FEAT-36 |
| Related feature | FEAT-31 (FR-074) |
| Related business rules | BR-01, **BR-06**; **WA-05 / PQ-05** |
| Acceptance criteria | AC-ACT-04.3 |

**US-048 — Let the plan move the status**
> As a **Sales user**, I want trips to become In progress and Completed on their own at the planned times, so that nobody has to keep lists up to date by hand.

| | |
|---|---|
| Persona | System; observed by all |
| Preconditions | Accepted trip with planned start and end |
| Main workflow | At planned start the scheduler sets In progress; at planned end it sets Completed; each change is written to history with actor "System"; the detail page shows the next automatic change |
| Alternative workflow | The job runs late → the status catches up and monitoring alerts after 5 minutes (ES-10); for fixed trips, start and end are the first and last sub-trip times (**WA-09 / PQ-09**) |
| Dependencies | TEQ Scheduler |
| Related feature | FEAT-31 (FR-075), FEAT-49 (FR-106) |
| Related business rules | **BR-01**, BR-07; **Q5** |
| Acceptance criteria | AC-SCHED-01.1 |

**US-049 — Close a request nobody answered**
> As a **Sales user**, I want an unanswered request to close itself at the deadline and to be warned two hours before, so that I can act while there is still time.

| | |
|---|---|
| Persona | System; host P-SALES notified |
| Preconditions | Trip Requested with a response deadline; no acceptance |
| Main workflow | Two hours before the deadline → N-05 to the request's creator → at the deadline the pending requests expire, the trip becomes Rejected · "Expired" and the creator is notified |
| Alternative workflow | An accept attempted after the deadline is refused (ES-02); with no deadline set, the planned start is used (**WA-10 / PQ-10**) |
| Dependencies | FEAT-14, FEAT-49, FEAT-43 |
| Related feature | FEAT-32 (FR-076) |
| Related business rules | BR-01; OBJ-2; **Q6** |
| Acceptance criteria | AC-REQ-08.1, AC-NOTIF.1 |

**US-050 — Trust that finished trips stay finished**
> As a **Finance User**, I want closed trips to be unchangeable, so that what I settle against cannot move under me.

| | |
|---|---|
| Persona | All |
| Preconditions | Trip Completed, Cancelled or Rejected |
| Main workflow | Open a closed trip → no edit or status action is offered; only Comment and invoice actions remain |
| Alternative workflow | A direct API attempt is refused: "Closed trips can't be changed." (ES-06). Reopening is not available in this release (**Q3**) |
| Dependencies | FEAT-28 |
| Related feature | FEAT-33 (FR-077) |
| Related business rules | **BR-01**, BR-06; **Q3** |
| Acceptance criteria | AC-CLS-06.1 |

**US-051 — Answer several requests at once**
> As a **Partner Coordinator with a busy morning**, I want to accept or reject several received requests together, so that routine answers do not take one dialog each.

| | |
|---|---|
| Persona | P-PCOORD, P-ADMIN |
| Preconditions | Several eligible rows in Active Trips |
| Main workflow | Tick rows → "3 selected · Accept · Reject" → for reject, one reason for all → results reported per trip |
| Alternative workflow | One trip was taken meanwhile → "5 accepted, 1 already taken"; one failure never blocks the others |
| Dependencies | FEAT-29, FEAT-30 |
| Related feature | FEAT-34 (FR-078) |
| Related business rules | BR-03 |
| Acceptance criteria | AC-ACT-09.1 |

**US-052 — See one status for a trip, whatever happened to the others**
> As a **Partner Coordinator**, I want the trip to have exactly one status on my screen with a reason I can read, so that lists never contradict each other.

| | |
|---|---|
| Persona | All |
| Preconditions | A trip shared with several partners |
| Main workflow | Our share request state is mapped to one status for our company: pending → Requested; accepted → the trip's status; rejected → Rejected (our reason); expired → Rejected ("Expired"); withdrawn → Cancelled with the matching reason |
| Alternative workflow | The host continues to see the trip's own status throughout |
| Dependencies | FEAT-18, FEAT-22 |
| Related feature | FEAT-35 (FR-079) |
| Related business rules | **BR-01**, BR-04; **WA-01 / PQ-01 (blocking)** |
| Acceptance criteria | AC-ALL-03.1, AC-ACT-07.1 |

### EP-07 — Invoicing and settlement (MOD-07)

| | |
|---|---|
| **Epic ID** | EP-07 |
| **Objective** | Settle a Completed trip where the trip already is, with amounts that stop moving once a decision is made (OBJ-3). |
| **Related business requirements** | BN-CLS-04, BN-CLS-05, BN-INV-01…BN-INV-10, BR-06, BR-08 |

**US-053 — Raise an invoice from the trip**
> As a **Finance User at the partner company**, I want to create an invoice straight from a Completed trip, prefilled with what was agreed, so that billing takes minutes and matches the offer.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN of the partner company |
| Preconditions | Trip Completed and received by us; no non-Declined invoice exists |
| Main workflow | Closed Trips → **Create invoice** → a Draft opens, numbered `BN-INV-YYYY-NNNNNN`, with line 1 = agreed offer price, one line per additional cost, VAT from our company settings, and the trip's invoice comment and reference |
| Alternative workflow | Non-Completed trip → "Only Completed trips can be invoiced."; an active invoice exists → ES-07; Company Settings unavailable → creation blocked with a specific message (ES-27) |
| Dependencies | TEQ Company Settings |
| Related feature | FEAT-36 (FR-081, FR-082, FR-083) |
| Related business rules | **BR-06**, BR-08; **WA-04 / PQ-04 (blocking)** |
| Acceptance criteria | AC-CLS-04.1, AC-INV-03.1, AC-INV-04.1 |

**US-054 — Bill what actually happened**
> As a **Finance User**, I want to add lines such as waiting time or extra kilometres, so that the invoice reflects the real trip.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN of the issuing company |
| Preconditions | Invoice Draft (or Declined, being edited) |
| Main workflow | **+ Add line** → description, quantity, unit price, VAT rate → line net and VAT calculate → totals update |
| Alternative workflow | Missing description or quantity ≤ 0 → the line cannot be saved ("Add a description for line 3.") |
| Dependencies | — |
| Related feature | FEAT-37 (FR-084, FR-085) |
| Related business rules | **BR-08** |
| Acceptance criteria | AC-INV-05.1 |

**US-055 — Send the invoice**
> As a **Finance User**, I want to submit the invoice to the host, so that their finance team can review it.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN of the partner company |
| Preconditions | Status Draft with at least one valid line |
| Main workflow | **Submit** → totals summary → confirm → status Pending, `submitted_at` recorded → host finance notified → their badge and dashboard figure increase |
| Alternative workflow | A Draft that was never sent can be deleted instead (FR-095); a double click submits once (ES-23) |
| Dependencies | FEAT-43 |
| Related feature | FEAT-38 (FR-086) |
| Related business rules | BR-04 |
| Acceptance criteria | AC-INV-06.2 |

**US-056 — Approve an invoice**
> As a **Finance User at the host company**, I want to approve an incoming invoice and have the amounts lock, so that what we agreed is what we pay.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN of the host company |
| Preconditions | Incoming invoice Pending |
| Main workflow | Invoice List › Incoming → open → **Approve** → dialog states amounts will be locked → confirm → status Approved, decided by and at recorded, lines snapshotted → partner finance notified |
| Alternative workflow | After approval nobody can edit the invoice; a later change to the trip price does not alter it (ES-06 equivalent for invoices) |
| Dependencies | FEAT-41, FEAT-43 |
| Related feature | FEAT-38 (FR-087), FEAT-41 (FR-092) |
| Related business rules | NFR-04 |
| Acceptance criteria | AC-INV-06.1, AC-INV-07.1 |

**US-057 — Decline an invoice with a reason**
> As a **Finance User at the host company**, I want to decline an invoice with a reason, so that the partner can correct it instead of guessing.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN of the host company |
| Preconditions | Incoming invoice Pending |
| Main workflow | **Decline** → reason from the list or *Other* with text → confirm → status Declined with the reason, amounts snapshotted → partner finance notified |
| Alternative workflow | Without a reason the button stays disabled and the API refuses (ES-19) |
| Dependencies | FEAT-43 |
| Related feature | FEAT-38 (FR-088) |
| Related business rules | NFR-04; **WA-07 / PQ-07** |
| Acceptance criteria | AC-INV-06.1 |

**US-058 — Fix and resend a declined invoice**
> As a **Finance User at the partner company**, I want to correct a declined invoice and send it again as a new version, so that the history of the dispute is kept.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN of the issuing company |
| Preconditions | Invoice Declined |
| Main workflow | **Edit & resubmit** → a new version (v2) opens as Draft with the previous lines → correct → Submit → Pending again; the declined version stays read-only behind a version switcher |
| Alternative workflow | Two concurrent resubmissions create one new version (ES-20) |
| Dependencies | FEAT-38 |
| Related feature | FEAT-39 (FR-089) |
| Related business rules | **BR-06**, NFR-04; **WA-11 / PQ-11** |
| Acceptance criteria | AC-INV-03.2 |

**US-059 — Find invoices and see what they add up to**
> As a **Finance User**, I want incoming, outgoing and archived invoices with filters and totals, so that I can see what is owed and owing.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN |
| Preconditions | Invoice List visible |
| Main workflow | Choose a sub-tab → filter by status, company, trip date or invoice date → search by trip ID, invoice no. or company → read the footer totals for all filtered invoices |
| Alternative workflow | Invoices decided more than 90 days ago are in Archive only; the *Customer* column is absent for a partner |
| Dependencies | FEAT-18 |
| Related feature | FEAT-40 (FR-090, FR-091, FR-094) |
| Related business rules | **BR-04**, BR-07, BR-08 |
| Acceptance criteria | AC-INV-01.1, AC-INV-02.1, AC-INV-10.1, AC-INV-cust |

**US-060 — Hand the invoice to accounting**
> As a **Finance User**, I want a PDF of the invoice in our language with both companies' details, so that I can pass it to our accounting system myself.

| | |
|---|---|
| Persona | P-FIN, P-ADMIN |
| Preconditions | Invoice exists |
| Main workflow | **Download PDF** → the PDF opens in the viewing company's language with both parties' details, lines, VAT per rate, totals, status and decided date |
| Alternative workflow | For a decided invoice the PDF uses the locked snapshot; posting to accounting systems stays out of scope (BRD §4) |
| Dependencies | TEQ Company Settings, S3 |
| Related feature | FEAT-42 (FR-093) |
| Related business rules | BR-04, NFR-06 |
| Acceptance criteria | AC-INV-09.1 |

### EP-08 — Notifications (MOD-08)

| | |
|---|---|
| **Epic ID** | EP-08 |
| **Objective** | Put every lifecycle event in front of the person who must act, without drowning them (BRD §11, BRD §14 mitigation). |
| **Related business requirements** | BRD §11, BRD §14, NFR-06 |

**US-061 — Be told when something needs me**
> As a **Partner Coordinator**, I want a notification the moment a request arrives, so that I can answer it while it is still useful.

| | |
|---|---|
| Persona | All (recipients differ per event) |
| Preconditions | The causing action has committed; the recipient is in scope |
| Main workflow | Event occurs → in-app and email are sent (push for new requests; SMS for a cancellation within 24 h of start) in the recipient company's language → the message deep-links to the trip or invoice |
| Alternative workflow | A failed send is retried and logged and never rolls back the action (ES-18); a scheduler re-run never duplicates a message |
| Dependencies | TEQ channels |
| Related feature | FEAT-43 (FR-096, FR-097, FR-099) |
| Related business rules | BR-04, BR-09, NFR-06; **WA-27 / PQ-17** |
| Acceptance criteria | AC-NOTIF.1 |

**US-062 — Keep notifications useful**
> As a **busy coordinator**, I want to choose which channels I get per event and to opt into a daily summary, so that I am not flooded.

| | |
|---|---|
| Persona | All; P-ADMIN sets company defaults |
| Preconditions | Signed in |
| Main workflow | Notifications panel → settings → toggle channels per event → opt into the daily summary |
| Alternative workflow | In-app cannot be switched off, so nothing is lost silently |
| Dependencies | FEAT-43 |
| Related feature | FEAT-44 (FR-098) |
| Related business rules | — |
| Acceptance criteria | AC-NOTIF.2 |

### EP-09 — Access, permissions and visibility (MOD-09)

| | |
|---|---|
| **Epic ID** | EP-09 |
| **Objective** | Each company sees only its own work, each user only their departments, and each partner only what it needs to run the trip (BR-04, BR-09, NFR-03, NFR-05). |
| **Related business requirements** | BRD §5, BR-04, BR-09, NFR-03, NFR-05 |

**US-063 — See only my company's work**
> As a **user in one department**, I want lists, counts, badges, exports and notifications limited to my scope, so that I am never shown work that is not mine.

| | |
|---|---|
| Persona | All |
| Preconditions | Session with company and departments resolved |
| Main workflow | Any screen → results are filtered in the query layer by company and departments |
| Alternative workflow | Opening an out-of-scope object returns "Trip not found." / "Invoice not found.", and the attempt is logged (ES-13) |
| Dependencies | TEQ permissions |
| Related feature | FEAT-46 (FR-102, FR-104) |
| Related business rules | **BR-04**, **BR-09** |
| Acceptance criteria | AC-SCOPE.1 |

**US-064 — Keep commercial data on our side**
> As a **Sales user at the host company**, I want the partner never to see our customer price or customer details beyond what they need, so that sharing a trip does not share our commercial position.

| | |
|---|---|
| Persona | P-SALES (protected for every host); enforced for all |
| Preconditions | A trip shared with a partner |
| Main workflow | The partner's page and API response contain only the fields in FR-103: their own price and costs, the trip's operational data, and contact person name and phone, sign, group ref. and flight no. |
| Alternative workflow | Exports and PDFs follow the same filter; the *Customer* column is absent for a partner |
| Dependencies | Data-sharing contract |
| Related feature | FEAT-47 (FR-103) |
| Related business rules | **BR-04**, NFR-05; **WA-08 / PQ-15 (blocking, DPO)** |
| Acceptance criteria | AC-DTL-01.2, AC-INV-cust |

**US-065 — Be stopped politely when I may not do something**
> As **any user**, I want an action I may not take to be absent rather than failing later, and a refusal to be clear when it happens, so that I always know where I stand.

| | |
|---|---|
| Persona | All |
| Preconditions | Role, side and status resolved |
| Main workflow | The UI offers only permitted actions (FR-069); the server checks again and refuses anything else with a specific message |
| Alternative workflow | Permission removed mid-session → the next action is refused and the view refreshes (ES-30); session expired → sign-in, then return to the same URL (ES-25) |
| Dependencies | FEAT-45 |
| Related feature | FEAT-46 (FR-101), FEAT-45 (FR-100) |
| Related business rules | BR-09, NFR-03 |
| Acceptance criteria | AC-ACT-04.1, AC-SESS-01.1 |

### EP-10 — Platform services (MOD-10)

| | |
|---|---|
| **Epic ID** | EP-10 |
| **Objective** | Carry the obligations under every feature: an audit trail, timely jobs, honest failure, measurement, and a lossless move off the legacy screens. |
| **Related business requirements** | NFR-03, NFR-04, BRD §13, BRD §14, OBJ-1…OBJ-5 |

**US-066 — Prove what happened**
> As a **Company Admin**, I want an immutable record of status changes, price overrides and invoice decisions for five years, so that any dispute can be settled from the record.

| | |
|---|---|
| Persona | P-ADMIN, P-FIN, SH-15 |
| Preconditions | A recorded change occurs |
| Main workflow | Every change writes an audit entry in the same transaction with user or "System", company, time and before/after → visible in trip history, exports and an audit export |
| Alternative workflow | Entries cannot be edited or deleted; exports of lists are themselves logged |
| Dependencies | — |
| Related feature | FEAT-48 (FR-105) |
| Related business rules | **NFR-04** |
| Acceptance criteria | AC-AUDIT.1 |

**US-067 — Know when the machinery is late**
> As an **Engineering Lead**, I want alerts when a scheduled job is late or a dependency fails, so that a silent failure does not become a wrong status on a customer's screen.

| | |
|---|---|
| Persona | SH-04 (Engineering), System |
| Preconditions | Jobs and integrations running |
| Main workflow | Jobs run every minute and act within 5 minutes; lateness, notification failures, integration failures and authorization refusals are logged and alerted |
| Alternative workflow | On recovery, idempotent jobs catch up without repeating transitions or messages (ES-10) |
| Dependencies | TEQ Scheduler, monitoring |
| Related feature | FEAT-49 (FR-106), FEAT-51 (FR-108) |
| Related business rules | NFR-02, NFR-04 |
| Acceptance criteria | AC-SCHED-01.1, AC-PLAT-01.1 |

**US-068 — Measure whether the portal worked**
> As the **Product Owner**, I want the events behind M-1…M-5, so that I can tell whether the objectives are being met rather than guessing.

| | |
|---|---|
| Persona | SH-01 |
| Preconditions | Instrumented actions occur |
| Main workflow | TM-01…TM-13 events are emitted with company, role and `surface` but no personal data → M-1…M-5 are computed monthly against their baselines |
| Alternative workflow | M-5 needs support tags in place ≥ 3 months before launch (dependency D-4) |
| Dependencies | Analytics pipeline, support system |
| Related feature | FEAT-52 (FR-109) |
| Related business rules | NFR-05 |
| Acceptance criteria | AC-PLAT-02.1 |

**US-069 — Move off the old screens without losing anything**
> As the **Finance Lead**, I want existing trips and claims mapped into the new model with the totals reconciled, so that switching over does not lose or change what we are owed.

| | |
|---|---|
| Persona | SH-03, SH-12 |
| Preconditions | Access to legacy data and attribute names (dependency D-1) |
| Main workflow | Trial migration on a copy of production → trip counts per status and claim totals per company reconciled → exceptions listed in a report → Finance signs off → pilot, then GA |
| Alternative workflow | Anything that fits no mapping row is reported, never guessed; legacy screens keep working until retirement (BRD §14 constraint, **Q1**) |
| Dependencies | Bus Network service |
| Related feature | FEAT-53 (FR-110) |
| Related business rules | BR-01, BR-06 |
| Acceptance criteria | AC-PLAT-03.1 |

---

## 10. Acceptance criteria

Format: **Given** context · **When** action · **Then** observable result. Every criterion is specific, testable and consistent with the business rules; every user story has at least one, and every BRD requirement is covered (§16). Criteria keep the IDs used since v1.0, so the SPEC, Architecture Spine and UX package citations still resolve.

### 10.1 Navigation and shell (EP-01)

**AC-NAV-01.1** · US-001 · BRD §7
- **Given** a signed-in user of a company with a linked Bus Network account
- **When** any BusNetwork screen loads
- **Then** the navigation bar shows the tabs the user may open in the fixed order Dashboard · Request · Active Trips · Closed Trips · All Trips · Invoice List, with the current tab marked `aria-current="page"`.

**AC-NAV-02.1** · US-002 · BRD §7, FR-002
- **Given** a Finance User without *Create / share request*
- **When** the portal loads, and again when the user opens `/busnetwork/request` directly
- **Then** the Request tab is absent from the bar (not disabled), and the direct URL returns the standard refusal rather than the form.

**AC-NAV-03.1** · US-003 · BRD §7 badge, BN-INV-08
- **Given** 24 open trips and 3 incoming Pending invoices in the user's scope
- **When** any portal screen is open
- **Then** Active Trips shows badge "24" equal to the unfiltered Active Trips total, and Invoice List shows badge "3" equal to the Dashboard *Open invoices* count; with zero, no badge is shown.

### 10.2 Shared list behaviour (EP-04)

**AC-LST-01.1** · US-027 · BN-LST-01
- **Given** 137 trips match the current filters · **When** the list loads · **Then** 25 rows are shown, the total reads "137", and page sizes 10 / 25 / 50 / 100 are offered.

**AC-LST-01.2** · US-027 · BN-LST-01
- **Given** page 4 is open · **When** any filter changes · **Then** page 1 is shown.

**AC-LST-02.1** · US-027 · BN-LST-02
- **Given** trips with group reference "SK-Ski-24" and to-address "Bergen" · **When** the user searches "ski" or "bergen" · **Then** those trips are returned; searching a Trip ID returns that trip.

**AC-LST-03.1** · US-027 · BN-LST-03, BR-07
- **Given** a user in Europe/Oslo and a trip starting 2026-09-20 23:30 local · **When** filtering From = To = 2026-09-20 · **Then** the trip is included, and a trip starting 2026-09-21 00:00 local is not.

**AC-LST-03.2** · US-027 · BN-LST-03
- **Given** From is later than To · **When** the filter is applied · **Then** an inline error appears and the list is unchanged.

**AC-LST-04.1** · US-027 · BN-LST-04
- **Given** the company is host on some trips and partner on others · **When** the company filter is opened with direction = All · **Then** partners and hosts are both listed under group headings, with "All companies" selected by default.

**AC-LST-05.1** · US-027 · BN-LST-05
- **Given** no sort has been chosen · **When** Active Trips loads, and then Closed and All Trips · **Then** Active is soonest start first and the others most recent first; sorting by Trip ID, start, length, PAX and price works in both directions with stable paging.

**AC-LST-06.1** · US-004 · BN-LST-06
- **Given** a filtered, sorted, paged view · **When** its URL is opened in a new session by a user with the same rights · **Then** the identical view appears.

**AC-LST-07.1** · US-027 · BN-LST-07
- **Given** a trip stored as 2026-09-20T06:00Z viewed by an Oslo user · **When** the row renders · **Then** the start reads "2026-09-20 08:00" and a 390-minute trip reads "6h 30m".

**AC-LST-08.1** · US-036 · BN-LST-08
- **Given** filters that match nothing · **When** the list renders · **Then** it reads "No active trips match these filters." and offers **Clear filters**, which restores results.

**AC-LST-09.1** · US-028 · BN-LST-09
- **Given** 3 000 matching rows across 120 pages · **When** the user exports XLSX · **Then** the file contains 3 000 rows with the visible columns and the time zone named in the header row.

**AC-LST-10.1** · US-035 · BN-LST-10
- **Given** page 3 scrolled halfway with filters applied · **When** the user opens a trip and returns · **Then** page, filters, sort and scroll position are restored.

### 10.3 Dashboard (EP-02)

**AC-DSH-01.1** · US-005 · BN-DSH-01
- **Given** seeded data with known counts · **When** the Dashboard loads · **Then** the five key figures equal their §6.2 definitions for the user's company and departments, and a zero value renders as "0".

**AC-DSH-02.1** · US-006 · BN-DSH-02
- **Given** the Dashboard is open · **When** the user selects each key figure in turn · **Then** the list in §6.2 / Appendix A opens with those filters visible both as chips and in the URL.

**AC-DSH-03.1** · US-007 · BN-DSH-03
- **Given** 14 Accepted or In progress trips · **When** the Dashboard loads · **Then** *Upcoming trips* lists the 10 with the earliest start, each linking to its detail page.

**AC-DSH-04.1** · US-008 · BN-DSH-04
- **Given** a Partner Coordinator with 2 incoming requests and 1 unread comment · **When** the Dashboard loads · **Then** *Needs your action* shows those 3 items; after accepting one request it shows 2.

**AC-DSH-04.2** · US-009 · BN-DSH-04
- **Given** a Finance User with incoming Pending invoices · **When** the Dashboard loads · **Then** those invoices appear in *Needs your action*; after Approve the item disappears.

**AC-DSH-04.3** · US-013 · BN-DSH-04, BRD §5 Viewer
- **Given** a Viewer with no action rights · **When** the Dashboard loads · **Then** *Recent activity* replaces *Needs your action* and no action button appears anywhere on the page.

**AC-DSH-05.1** · US-010 · BN-DSH-05
- **Given** the Dashboard is open · **When** the user chooses "Last 30 days" · **Then** the period figure and the charts recalculate and the label changes, while the non-period figures do not.

**AC-DSH-06.1** · US-010 · BN-DSH-06
- **Given** 12 weeks of data · **When** the volume chart renders · **Then** it shows 12 ISO weeks with shared and received counts matching the data, and the same numbers are available as a table.

**AC-DSH-07.1** · US-011 · BN-DSH-07
- **Given** completed trips in the period · **When** *Top partners* renders · **Then** the five counterpart companies with the most Completed trips are listed in descending order (names subject to **Q7**).

**AC-DSH-08.1** · US-012 · BN-DSH-08
- **Given** a trip is accepted · **When** up to 5 minutes pass · **Then** the figures reflect it, and "Updated HH:MM" is never older than 5 minutes while the page is open.

### 10.4 Request and share (EP-03)

**AC-REQ-01.1** · US-014 · BN-REQ-01, BN-REQ-10
- **Given** step 1 with an end time before the start time · **When** the user presses Next · **Then** the step does not complete and the end field shows "End time must be after start time (start 2026-09-20 08:00)."

**AC-REQ-01.2** · US-014 · BN-REQ-01
- **Given** trip type Fixed · **When** step 1 renders · **Then** the Shifts section is required and is hidden for a normal trip; going back from step 3 to step 1 keeps every entered value.

**AC-REQ-01.3** · US-015 · BN-REQ-01, BN-REQ-09
- **Given** TEQ trip 48213 · **When** the user chooses **Share** · **Then** the form opens prefilled with its type, customer, route, times, PAX and vehicle requirements, with a banner naming the source trip.

**AC-REQ-01.4** · US-026 · BN-REQ-01 (attachments)
- **Given** a 14 MB PDF, an XLSX file, and two files already attached · **When** each is added · **Then** each is refused with its specific message, and a clean file within the limits is attached and listed with name, size and uploader.

**AC-REQ-02.1** · US-016 · BN-REQ-02
- **Given** a half-completed step 2 · **When** the user saves a draft and reopens it the next day · **Then** it opens at step 2 with the same data, and the draft appears in no trip list.

**AC-REQ-03.1** · US-017 · BN-REQ-03, BR-02
- **Given** affiliations Accepted (A, B) and Pending (C) · **When** step 2 renders · **Then** only A and B are listed with name, category, agreement and rate, and search and name sort work.

**AC-REQ-04.1** · US-017 · BN-REQ-04
- **Given** partners A and B are selected · **When** step 3 renders · **Then** there is one offer-price row for each.

**AC-REQ-05.1** · US-018 · BN-REQ-05, BR-08
- **Given** a customer price of 20 000 and a percentage agreement at 85 · **When** the offer price is calculated · **Then** it is 17 000,00; given 12 345,67 at 33.3 it is 4 111,11 (half away from zero).

**AC-REQ-05.2** · US-019 · BN-REQ-05
- **Given** a calculated price of 16 500 · **When** the user overrides it to 16 800 · **Then** the row shows both values with the user's name, and history records calculated value, new value, user and time.

**AC-REQ-05.3** · US-018 · BN-REQ-05
- **Given** a partner with no price agreement · **When** step 3 renders · **Then** its price is 0 and Submit is blocked until a price greater than 0 is entered.

**AC-REQ-06.1** · US-020 · BN-REQ-06
- **Given** partners A and B · **When** "Ferry 1 200" is added for A · **Then** it is shown separately from the offer price, is visible to A and not to B, and prefills A's invoice.

**AC-REQ-07.1** · US-025 · BN-REQ-07
- **Given** a default partner with a full-day agreement · **When** the user uses Quick share after step 1 · **Then** the trip is Requested to that partner at the unmodified full-day rate.

**AC-REQ-08.1** · US-021, US-049 · BN-REQ-08
- **Given** a deadline of 12:00 and no acceptance · **When** 12:00 passes · **Then** within 5 minutes the trip is Rejected with reason "Expired" and the request's creator is notified.

**AC-REQ-08.2** · US-021 · BN-REQ-08, WA-10
- **Given** a planned start of 2026-09-20 08:00 · **When** a deadline after that is entered · **Then** it is refused with a message naming the planned start.

**AC-REQ-09.1** · US-022 · BN-REQ-09
- **Given** a valid request to two partners · **When** the user submits · **Then** the success screen shows the Trip ID linking to the trip in Active Trips, and the original TEQ trip shows it is shared with a link back.

**AC-REQ-10.1** · US-023 · BN-REQ-10
- **Given** every validation rule in §6.3 · **When** each is triggered · **Then** the message names the field and how to fix it, reviewed against the §6.3 tables.

### 10.5 Active Trips, lifecycle and trip detail (EP-04, EP-05, EP-06)

**AC-ACT-01.1** · US-029 · BN-ACT-01
- **Given** trips in all six statuses · **When** Active Trips loads · **Then** it lists exactly those whose company-view status is Requested, Accepted or In progress.

**AC-ACT-02.1** · US-029 · BN-ACT-02
- **Given** the company is host on some trips and partner on others · **When** "Received by us" is chosen · **Then** only trips where the company is partner remain.

**AC-ACT-03.1** · US-029 · BN-ACT-03
- **Given** the status filter · **When** Accepted and In progress are selected · **Then** Requested trips are excluded.

**AC-ACT-04.1** · US-065 · BN-ACT-04, BN-DTL-06, BN-ALL-04
- **Given** each row of the §6.6 action matrix · **When** a user with an allowed role views the trip · **Then** exactly the listed actions are offered; a user without the role sees none of them and an API call is refused.

**AC-ACT-04.2** · US-024 · BN-ACT-04 (Edit)
- **Given** a Requested trip shared with partners A and B · **When** the host edits it, removing B and adding C · **Then** B's request is withdrawn with "Removed by host", C receives a new request and N-01, A sees the updated details marked "Updated since you last viewed", and each change is in history.

**AC-ACT-04.3** · US-047 · BRD §7 (Mark complete)
- **Given** an In progress trip received by the company and a Partner Coordinator · **When** *Mark complete* is confirmed · **Then** the status becomes Completed with `closed_at` set, the trip appears in Closed Trips with "Not invoiced", and history records the actor.

**AC-ACT-05.1** · US-045, US-046 · BN-ACT-05
- **Given** a Reject or Cancel dialog · **When** the user confirms without a reason · **Then** the action cannot be completed; with *Other*, free text is required, and the stored reason is visible to the other company.

**AC-ACT-05.2** · US-046 · BN-ACT-05, BRD §11
- **Given** an Accepted trip starting in 12 hours · **When** the host cancels it · **Then** the dialog warns that an SMS will be sent, and the partner receives in-app, email and SMS.

**AC-ACT-06.1** · US-043 · BN-ACT-06
- **Given** a Requested trip received by the company · **When** the partner accepts · **Then** the host creator receives in-app and email notification and the partner is offered "Create quotation in TEQ".

**AC-ACT-07.1** · US-044 · BN-ACT-07, BR-03
- **Given** a request sent to A, B and C · **When** B accepts · **Then** B's request is Accepted, A's and C's are Withdrawn, A and C see the trip as Cancelled · "Another partner accepted" and receive an in-app notification.

**AC-ACT-07.2** · US-043 · BN-ACT-07, BR-03
- **Given** 20 simultaneous accepts from A and B · **When** they are processed · **Then** exactly one succeeds and every other attempt receives "Already taken".

**AC-ACT-08.1** · US-030 · BN-ACT-08
- **Given** a Requested trip starting in 23 hours · **When** the list renders · **Then** the "Starts < 24 h" flag is shown with text and icon; at 25 hours it is not.

**AC-ACT-09.1** · US-051 · BN-ACT-09
- **Given** 6 selected received requests, one of which was just taken · **When** the user accepts them together · **Then** 5 are accepted and 1 reports "Already taken".

**AC-DTL-01.1** · US-037 · BN-DTL-01
- **Given** a trip in scope · **When** the detail page loads · **Then** it shows header, route with map, schedule, PAX, vehicle requirements, pricing, attachments and comment fields.

**AC-DTL-01.2** · US-064 · BN-DTL-01, BR-04
- **Given** a partner user · **When** the detail page and its API response are inspected · **Then** the customer price, other partners' prices, HQ comment and invoice comment are absent from both.

**AC-DTL-02.1** · US-038 · BN-DTL-02
- **Given** an accepted partner has set an alternative start address · **When** the trip is viewed in detail, lists and exports · **Then** the alternative address is shown instead of the original, with "Original: …" available, and history records the change.

**AC-DTL-03.1** · US-037 · BN-DTL-03
- **Given** a fixed trip · **When** the detail page loads · **Then** its shifts and their sub-trips are shown.

**AC-DTL-04.1** · US-039 · BN-DTL-04
- **Given** a trip shared with a partner · **When** the Partner Coordinator posts a comment · **Then** it shows author, company and time, and the host's users on the trip receive an in-app notification and an unread marker.

**AC-DTL-05.1** · US-040 · BN-DTL-05
- **Given** a trip that was requested, price-overridden, accepted and cancelled · **When** the history is opened · **Then** four entries are shown with actor, company, time and before → after values.

**AC-DTL-06.1** · US-037 · BN-DTL-06
- **Given** the same trip, status and user · **When** the list row and the detail page are compared · **Then** they offer the same actions.

**AC-BR05.1** · US-042 · BR-05
- **Given** an Accepted trip at 17 000 · **When** the host proposes 18 000 and the partner confirms · **Then** the offer price becomes 18 000 and both acts appear as comments and in history; if the partner declines, the price is unchanged.

**AC-CONS-01.1** · US-041 · BRD §14 risk
- **Given** the nightly check finds the network trip's planned start differs from the TEQ trip's · **When** either company opens the trip · **Then** a banner names the field, both values and the check time, and no value has been overwritten.

**AC-SCHED-01.1** · US-048, US-067 · BRD §7, BRD §13
- **Given** an Accepted trip whose planned start has passed · **When** the scheduler runs · **Then** the status is In progress within 5 minutes with a "System" history entry; re-running the job changes nothing further and sends no second notification.

### 10.6 Closed Trips and All Trips (EP-04)

**AC-CLS-01.1** · US-031 · BN-CLS-01
- **Given** trips in all six statuses · **When** Closed Trips loads · **Then** it lists exactly Completed, Cancelled and Rejected trips, with the Closed date and Invoice columns.

**AC-CLS-02.1** · US-031 · BN-CLS-02
- **Given** closed-date filter 2026-09-01 to 2026-09-15 · **When** it is applied · **Then** only trips closed in that range appear, using whole days in the user's time zone.

**AC-CLS-03.1** · US-031 · BN-CLS-03
- **Given** a 120-character cancellation reason · **When** the row renders · **Then** it is shortened with the full text available on hover and on keyboard focus, and shown in full on the detail page.

**AC-CLS-04.1** · US-053 · BN-CLS-04
- **Given** a Completed trip received by the company and a Finance user · **When** *Create invoice* is chosen · **Then** a Draft opens prefilled with the agreed offer price and additional costs.

**AC-CLS-05.1** · US-031 · BN-CLS-05
- **Given** closed trips with and without invoices · **When** the list renders · **Then** the Invoice column shows "Not invoiced" or the invoice status linking to the invoice, and "—" for Cancelled and Rejected trips.

**AC-CLS-06.1** · US-050 · BN-CLS-06
- **Given** a closed trip · **When** the user views it and when an API call attempts a change · **Then** no edit or status action is offered and the API refuses with "Closed trips can't be changed."

**AC-CLS-07.1** · US-032 · BN-CLS-07
- **Given** the quick filter "Completed, not invoiced" · **When** it is selected · **Then** only Completed, received trips with no invoice other than Declined ones are listed.

**AC-ALL-01.1** · US-033 · BN-ALL-01
- **Given** trips where the company is host or partner · **When** All Trips loads · **Then** every one of them is listed, in all six statuses.

**AC-ALL-02.1** · US-033 · BN-ALL-02
- **Given** the grouped status filter · **When** the "Closed" heading is ticked · **Then** Completed, Cancelled and Rejected are all selected.

**AC-ALL-03.1** · US-033, US-052 · BN-ALL-03, BR-01
- **Given** seeded data and 50 random filter combinations · **When** each is applied to all three lists · **Then** `count(All) = count(Active) + count(Closed)` every time, and every trip appears in exactly one of Active and Closed.

**AC-ALL-04.1** · US-033 · BN-ALL-04
- **Given** any trip · **When** its row is compared on All Trips and on its Active or Closed list · **Then** the available actions are identical.

**AC-ALL-05.1** · US-034 · BN-ALL-05
- **Given** PAX and Shift hidden by the user · **When** they sign in on another device · **Then** those columns are still hidden, and Trip ID and Status could not be hidden.

**AC-ALL-06.1** · US-028, US-033 · BN-ALL-06
- **Given** a filtered All Trips view · **When** it is exported · **Then** the file contains all columns plus the status-change history of each exported trip.

### 10.7 Invoicing (EP-07)

**AC-INV-01.1** · US-059 · BN-INV-01
- **Given** invoices approved 89 and 91 days ago · **When** the sub-tabs are opened · **Then** Incoming, Outgoing and Archive all exist, the 91-day invoice appears only in Archive and the 89-day one only in Incoming/Outgoing.

**AC-INV-02.1** · US-059 · BN-INV-02
- **Given** the Invoice List · **When** status, company, trip date and invoice date filters are combined with search, sort and paging · **Then** the result reflects every filter together.

**AC-INV-03.1** · US-053 · BN-INV-03, BR-06
- **Given** a Cancelled trip · **When** invoicing is attempted · **Then** *Create invoice* is unavailable and the API refuses; given a trip with a Pending invoice, a second invoice is refused.

**AC-INV-03.2** · US-058 · BN-INV-03, BRD §9.6
- **Given** an invoice that has been Declined · **When** the partner edits and resubmits it · **Then** a new version (v2) of the same invoice number becomes Pending and the declined version remains readable and read-only.

**AC-INV-04.1** · US-053 · BN-INV-04
- **Given** an offer price of 17 000, a ferry cost of 1 200 and a 25% VAT setting · **When** the Draft is created · **Then** it has two lines and totals 18 200,00 / 4 550,00 / 22 750,00.

**AC-INV-05.1** · US-054 · BN-INV-05
- **Given** a Draft invoice · **When** a line is added without a description · **Then** it cannot be saved; with quantity 2 × 450 at 25%, the line totals are 900,00 and 225,00.

**AC-INV-06.1** · US-056, US-057 · BN-INV-06
- **Given** a Pending incoming invoice · **When** it is approved · **Then** the amounts can no longer be edited; when it is declined without a reason the action cannot be confirmed, and with a reason the partner's finance users are notified.

**AC-INV-06.2** · US-055 · BRD §9.6 (Draft → Pending)
- **Given** a Draft invoice with at least one valid line · **When** it is submitted · **Then** it becomes Pending with `submitted_at` recorded, the host's finance users are notified, and the host's badge and dashboard figure increase by one.

**AC-INV-07.1** · US-056 · BN-INV-07
- **Given** an Approved invoice · **When** the trip's offer price is later changed · **Then** the invoice still shows the amounts as approved.

**AC-INV-08.1** · US-003, US-009 · BN-INV-08
- **Given** 3 incoming Pending invoices · **When** the portal renders · **Then** the navigation badge and the Dashboard figure both show 3; after one is approved, both show 2.

**AC-INV-09.1** · US-060 · BN-INV-09
- **Given** a Swedish partner viewing an invoice · **When** the PDF is downloaded · **Then** it is in sv_SE with both companies' details, the lines, VAT per rate and the totals.

**AC-INV-10.1** · US-059 · BN-INV-10
- **Given** 60 filtered invoices across 3 pages · **When** the footer renders · **Then** its totals equal the sum of all 60, with one row per currency if they differ.

**AC-INV-cust** · US-064 · BR-04
- **Given** a partner user · **When** the Invoice List and its export are inspected · **Then** the *Customer* column is absent from both.

### 10.8 Cross-cutting (EP-08, EP-09, EP-10)

**AC-SCOPE.1** · US-063 · BR-09
- **Given** a user limited to department "West" · **When** any list, count, badge, export, notification or detail page is produced · **Then** it contains no trip or invoice from another department or company.

**AC-SESS-01.1** · US-065 · NFR-03, DR-18
- **Given** a user whose session has expired with a part-completed form open · **When** they act · **Then** they are sent to TEQ sign-in and returned to the same URL afterwards, no partial change was applied, and unsent input is still present (**WA-31 / PQ-23**).

**AC-NOTIF.1** · US-061, US-049 · BRD §11
- **Given** each of N-01…N-08 · **When** the event occurs · **Then** the listed recipients receive the message on the listed channels in their company's language with a working deep link, and SMS is used for a cancellation only when the trip starts within 24 hours.

**AC-NOTIF.2** · US-062 · BRD §14 mitigation
- **Given** a user who has switched off email for "New comment" · **When** a comment is posted · **Then** no email is sent, the in-app notification still appears, and the daily summary includes the event if the user opted in.

**AC-AUDIT.1** · US-066, US-040 · NFR-04
- **Given** any status change, price override, approval or decline · **When** it commits · **Then** an audit entry exists with user (or "System"), time, and before and after values, and it cannot be modified afterwards.

**AC-A11Y.1** · all screens · NFR-07
- **Given** each screen in §14 · **When** automated WCAG 2.1 AA checks and a keyboard-only run-through of UJ-01…UJ-08 are performed · **Then** both pass, with status conveyed by text as well as colour and a keyboard alternative for drag-reordering.

**AC-PLAT-01.1** · US-067 · BRD §13, NFR-02
- **Given** a scheduler job that has not completed 5 minutes after its due moment · **When** monitoring evaluates it · **Then** an alert is raised, and when the job recovers the pending transitions are applied exactly once.

**AC-PLAT-02.1** · US-068 · OBJ-1…OBJ-5
- **Given** a month of portal use · **When** M-1…M-5 are computed from TM-01…TM-13 · **Then** each metric has a value against its baseline and no event carries personal data.

**AC-PLAT-03.1** · US-069 · BRD §14
- **Given** a trial migration on a copy of production · **When** it completes · **Then** trip counts per status and claim totals per company reconcile with the legacy system, and every record that fits no mapping row appears in the exception report.

---

## 11. Business rules → feature constraints

Every rule in BRD §10 is reproduced as written, then mapped to the features it constrains, the constraint the product must enforce, the behaviour that proves it and the acceptance criteria that test it. **No rule is reinterpreted**; where a rule is silent about a case the product must handle, the gap is carried as a working assumption with a question, never as a changed rule.

### BR-01 — One status decides the tab

| | |
|---|---|
| **Business rule** | "A trip has exactly one status. The status alone decides which tab shows the trip (§7). No other flag changes where a trip is listed." |
| **Related features** | FEAT-35, FEAT-18, FEAT-20, FEAT-21, FEAT-22, FEAT-28, FEAT-33 |
| **Constraint** | Trip status is a single stored field with a single writer; list membership is decided by a status predicate only; a company's view status is derived once, from its own share request (FR-079). |
| **Expected system behaviour** | Active, Closed and All Trips are one query with different status sets; `count(All) = count(Active) + count(Closed)` for identical filters; a trip is never in two lists and never missing from All; drafts have no status and appear in no list. |
| **Related acceptance criteria** | AC-ALL-03.1, AC-ACT-01.1, AC-CLS-01.1, AC-ALL-01.1, AC-REQ-02.1 |
| **Open items** | **WA-01 / PQ-01 (blocking R1)** — how a withdrawn or expired partner request maps onto the six statuses. |

### BR-02 — Only accepted affiliations may receive requests

| | |
|---|---|
| **Business rule** | "Requests can only be sent to partners with an accepted affiliation." |
| **Related features** | FEAT-12, FEAT-15, FEAT-17 |
| **Constraint** | The partner picker queries accepted affiliations only, and the affiliation is re-checked inside the submit transaction. |
| **Expected system behaviour** | A partner without an accepted affiliation cannot be selected; if an affiliation lapses between steps, submit is refused naming that partner; Quick share is unavailable without an accepted default partner. |
| **Related acceptance criteria** | AC-REQ-03.1, AC-REQ-07.1; edge case ES-09 |
| **Open items** | — |

### BR-03 — First accept wins

| | |
|---|---|
| **Business rule** | "The first partner to accept gets the trip. The other partners' offers are withdrawn automatically." |
| **Related features** | FEAT-29, FEAT-34, FEAT-35 |
| **Constraint** | Acceptance is an atomic conditional update: it succeeds only while the trip is Requested and that partner's request is `PENDING`; the withdrawal of the other requests happens in the same transaction (DR-04). |
| **Expected system behaviour** | Exactly one share request can ever be `ACCEPTED`; losers see "Already taken", are notified in-app, and see the trip as Cancelled · "Another partner accepted"; bulk accept reports per-trip results. |
| **Related acceptance criteria** | AC-ACT-07.1, AC-ACT-07.2, AC-ACT-09.1; edge case ES-01 |
| **Open items** | **Q4** — whether the host should instead choose among several acceptors. |

### BR-04 — Company-only visibility; limited customer data to partners

| | |
|---|---|
| **Business rule** | "Each company sees only its own trips and invoices. A partner never sees the host's customer price or customer contact details, except for what's needed to run the trip." |
| **Related features** | FEAT-47, FEAT-46, FEAT-23, FEAT-25, FEAT-40, FEAT-19 |
| **Constraint** | Field-level filtering happens server-side per viewing company, before rendering, export or API response; the counterpart company is the only other company ever named. |
| **Expected system behaviour** | A partner's page and API response contain no customer price, no other partner's price, response or comment, no HQ comment, no invoice comment and no Invoice List *Customer* column; exports and PDFs follow the same filter; the history shows a partner only what concerns it. |
| **Related acceptance criteria** | AC-DTL-01.2, AC-INV-cust, AC-SCOPE.1 |
| **Open items** | **WA-08 / PQ-15 (blocking R1, DPO)** — the exact customer fields "needed to run the trip". |

### BR-05 — Price change after acceptance needs both companies

| | |
|---|---|
| **Business rule** | "Once a trip is Accepted, changing its price requires agreement from both companies, recorded as a comment and in the history log." |
| **Related features** | FEAT-27, FEAT-24, FEAT-25, FEAT-13 |
| **Constraint** | After acceptance the offer price is not directly editable by anyone; it changes only through a proposal the counterpart confirms. |
| **Expected system behaviour** | Host proposes a new price with a required comment; the partner sees Confirm / Decline; the price changes only on Confirm; proposal, confirmation and decline are each posted as a comment and written to history with before/after values. |
| **Related acceptance criteria** | AC-BR05.1, AC-DTL-05.1 |
| **Open items** | **WA-21 / PQ-21** — that propose/confirm is the agreed portal mechanism. |

### BR-06 — Only Completed trips can be invoiced

| | |
|---|---|
| **Business rule** | "Only Completed trips can be invoiced. Cancelled and Rejected trips can't be invoiced." |
| **Related features** | FEAT-36, FEAT-21, FEAT-39 |
| **Constraint** | Invoice creation is guarded on trip status Completed and on there being no non-Declined invoice for that trip. |
| **Expected system behaviour** | *Create invoice* is absent on Cancelled and Rejected rows and the API refuses; the Invoice column shows "—" for them; a second active invoice is refused naming the existing one; after a decline a new version is allowed. |
| **Related acceptance criteria** | AC-INV-03.1, AC-INV-03.2, AC-CLS-05.1; edge case ES-07 |
| **Open items** | — |

### BR-07 — UTC storage, local display, whole-day filters

| | |
|---|---|
| **Business rule** | "All times are stored in UTC and shown in the user's time zone. Date filters include the whole of each day." |
| **Related features** | FEAT-18, FEAT-20, FEAT-21, FEAT-31, FEAT-32, FEAT-40 |
| **Constraint** | One conversion utility; storage type is UTC; From = 00:00:00 and To = 23:59:59 in the user's zone, converted to a UTC window for the query. |
| **Expected system behaviour** | Two users in different zones each see their own local times for the same trip and filter by their own days; scheduler comparisons use UTC; displayed format is `YYYY-MM-DD HH:MM` and `Xh Ym`. |
| **Related acceptance criteria** | AC-LST-03.1, AC-LST-07.1, AC-CLS-02.1; edge case ES-22 |
| **Open items** | — |

### BR-08 — Host currency, standard rounding to 2 decimals

| | |
|---|---|
| **Business rule** | "Amounts are in the host company's currency and rounded using standard rounding to 2 decimals." |
| **Related features** | FEAT-13, FEAT-37, FEAT-40, FEAT-42 |
| **Constraint** | One rounding function (half away from zero) used by pricing and invoicing; money stored as integer minor units with an explicit currency; the host's currency applies to trip and invoice amounts alike. |
| **Expected system behaviour** | 20 000 × 85% = 17 000,00; 12 345,67 × 33.3% = 4 111,11; invoice line and total arithmetic uses the same function; the Invoice List footer shows one row per currency if a filtered set spans currencies. |
| **Related acceptance criteria** | AC-REQ-05.1, AC-INV-04.1, AC-INV-05.1, AC-INV-10.1 |
| **Open items** | **WA-17 / PQ-13** — reconciling BR-08 ("host company's currency") with the BRD §9.6 column wording ("company currency"). |

### BR-09 — Department scope, as elsewhere in TEQ

| | |
|---|---|
| **Business rule** | "What each user can see is limited by their departments, the same as in the rest of TEQ." |
| **Related features** | FEAT-46, FEAT-02, FEAT-04, FEAT-19, FEAT-43 |
| **Constraint** | The scope filter is applied in the query layer of every endpoint, so lists, counts, badges, exports, notifications and detail pages cannot bypass it. |
| **Expected system behaviour** | A user scoped to one department never sees another department's trips or invoices anywhere; an out-of-scope object returns "not found" rather than a permission error, and the attempt is logged. |
| **Related acceptance criteria** | AC-SCOPE.1; edge case ES-13 |
| **Open items** | **WA-27 / PQ-17** — which users receive company-level notifications when received trips are department-scoped. |

### 11.1 Requirement-level constraints that behave like rules

These are BRD functional requirements whose effect is a constraint on other features; they are listed here so nothing enforcing behaviour is left implicit.

| Source | Constraint | Features constrained | Expected behaviour | Related AC |
|---|---|---|---|---|
| BN-ACT-07 | The other partners' requests are withdrawn automatically on acceptance | FEAT-29, FEAT-35 | Withdrawal in the accepting transaction; N-03 to each; view status Cancelled · "Another partner accepted" | AC-ACT-07.1 |
| BN-ACT-05 | Reject and Cancel require a reason shown to the other company | FEAT-30, FEAT-21 | No confirmation without a reason; reason stored, shown in row and detail, written to history | AC-ACT-05.1, AC-CLS-03.1 |
| BN-CLS-06 | Closed trips can't be edited or have their status changed | FEAT-33, FEAT-23 | No action offered; API refuses; reopening unavailable (**Q3**) | AC-CLS-06.1 |
| BN-INV-03 | One invoice per trip that isn't Declined; only for Completed trips | FEAT-36 | Guarded creation; second attempt refused naming the existing invoice | AC-INV-03.1 |
| BN-INV-07 | After a decision the saved amounts are shown, not a recalculation | FEAT-41, FEAT-42 | Snapshot at Approve/Decline read by list, invoice page and PDF | AC-INV-07.1 |
| BN-REQ-05 | Offer price follows the agreement formula; overrides are attributed | FEAT-13 | Calculated value kept alongside the override, with user and time in history | AC-REQ-05.1, AC-REQ-05.2 |
| BN-LST-03 | Date filters include the whole of each day | FEAT-18 | 00:00:00–23:59:59 in the user's zone, converted to UTC | AC-LST-03.1 |
| BN-DSH-08 | Dashboard data at most 5 minutes old | FEAT-08 | Freshness stamp and refresh; aggregate cache bounded at 5 minutes | AC-DSH-08.1 |
| BRD §7 | Status changes only through the listed transitions | FEAT-28…FEAT-33 | Any other transition is refused with a specific message | AC-ACT-04.1, AC-CLS-06.1 |

---

## 12. Edge cases → feature behaviour

Every edge case names the feature it belongs to, what triggers it, what the system does, what the user is told, what happens to data and state, and which acceptance criterion covers it. IDs ES-01…ES-24 are carried unchanged from v1.0; ES-25…ES-32 are added in this version to cover session, reload, network, permission-change, boundary and duplicate-action cases.

### 12.1 Concurrency and conflicting actions

| ID | Feature (FR) | Scenario and trigger | Expected system behaviour | User-facing message | Data / state impact | Related AC |
|---|---|---|---|---|---|---|
| ES-01 | FEAT-29 (FR-070, FR-071) | Two partners accept the same request within milliseconds | The first commit wins; the second is refused by the conditional update | "Already taken — another partner accepted this trip." | Exactly one share request `ACCEPTED`; others `WITHDRAWN`; one set of notifications | AC-ACT-07.2 |
| ES-02 | FEAT-32 (FR-076) | A partner accepts after the deadline passed while its page was open | Refused; server time decides | "This request expired at 12:00." | Trip already Rejected · "Expired"; no state change from the attempt | AC-REQ-08.1 |
| ES-03 | FEAT-29, FEAT-16 | A partner accepts a request the host has just cancelled or edited them out of | Refused with the specific cause | "Nordic Coaches cancelled this request: {reason}." / "…removed you from this request." | Share request already `WITHDRAWN`; nothing changes | AC-ACT-04.2 |
| ES-04 | FEAT-16, FEAT-29 | The host edits the trip while a partner is in the accept dialog | Accept is evaluated against the latest committed version; if the edit committed first, the dialog re-renders before acceptance | "Details changed — review before accepting" | Accept proceeds only after the partner confirms the new details | AC-ACT-04.2 |
| ES-20 | FEAT-39 (FR-089) | A declined invoice is resubmitted twice concurrently | One new version is created; the second attempt sees it | "This invoice has already been resubmitted as v2." | One new version; no duplicate numbering | AC-INV-03.2 |
| ES-23 | FEAT-15, FEAT-29, FEAT-38 | Double click on Submit, Accept or Approve | The command is idempotent; the button is disabled while in flight | — | One effect only; one notification | AC-REQ-09.1, AC-INV-06.2 |

### 12.2 State transitions and permissions

| ID | Feature (FR) | Scenario and trigger | Expected system behaviour | User-facing message | Data / state impact | Related AC |
|---|---|---|---|---|---|---|
| ES-05 | FEAT-30 (FR-073) | Cancel attempted on an In progress trip | Action is not offered; API refuses (**PQ-08**) | "In progress trips can't be cancelled." | No change; attempt logged | AC-ACT-04.1 |
| ES-06 | FEAT-33 (FR-077) | Any change attempted on a closed trip | Refused on every surface | "Closed trips can't be changed." | No change; attempt logged | AC-CLS-06.1 |
| ES-07 | FEAT-36 (FR-081, FR-082) | Invoice attempted for a non-Completed trip, or a second active invoice | Guard refuses at creation | "Only Completed trips can be invoiced." / "Trip 48213 already has invoice BN-INV-2026-000184 (Pending)." | No invoice created | AC-INV-03.1 |
| ES-13 | FEAT-46 (FR-104) | A user opens a trip or invoice outside their company or departments | Treated as non-existent | "Trip not found." / "Invoice not found." | No data disclosed; attempt logged | AC-SCOPE.1 |
| ES-19 | FEAT-38 (FR-088) | Decline attempted without a reason | Button stays disabled; API refuses | "Choose a reason for declining." | Invoice stays Pending | AC-INV-06.1 |
| ES-25 | FEAT-45 (FR-100) | The session expires while a form or dialog is open | The user is sent to TEQ sign-in and returned to the same URL; no partial change is applied; unsent input is still present (**WA-31 / PQ-23**) | "Your session expired. Sign in to continue — your input is still here." | Nothing committed; drafts recommended for long forms | AC-SESS-01.1 |
| ES-30 | FEAT-46 (FR-101) | A user's role or department scope changes while they have a page open | The next action is refused server-side and the view refreshes to the permitted state | "You no longer have permission to do this." | No change; attempt logged | AC-ACT-04.1 |

### 12.3 Input, validation and boundaries

| ID | Feature (FR) | Scenario and trigger | Expected system behaviour | User-facing message | Data / state impact | Related AC |
|---|---|---|---|---|---|---|
| ES-08 | FEAT-13 (FR-025) | A partner has no price agreement, so the offer price is 0 at submit | Step 3 blocks submission | "Enter an offer price for Nordfjord Buss — there is no price agreement." | Nothing submitted | AC-REQ-05.3 |
| ES-16 | FEAT-09 (FR-020) | Attachment of the wrong type, too large, a third file, or one that fails the scan | Each is refused individually; other files are unaffected | "'plan.xlsx' can't be attached. Use PDF, JPG, PNG or DOCX." · "'map.pdf' is 14 MB. The limit is 10 MB." · "You can attach up to 2 files." · "'x.pdf' failed the security scan and wasn't attached." | Rejected file is not stored or shared | AC-REQ-01.4 |
| ES-17 | FEAT-09 (FR-019) | Google Maps cannot resolve an address | Step 1 cannot be completed | "Choose an address from the suggestions so we can place it on the map." | No coordinates stored | AC-REQ-01.1 |
| ES-21 | FEAT-19 (FR-044) | Export of more than 50 000 matching rows | Refused before starting (**WA-28**) | "Narrow your filters to 50 000 rows or fewer." | No file generated | AC-LST-09.1 |
| ES-24 | FEAT-13 (FR-025) | Percentage agreement with no customer price | The row cannot calculate and Next is blocked | "Enter a customer price to calculate" | No offer price stored | AC-REQ-05.3 |
| ES-29 | FEAT-20, FEAT-40, FEAT-09 | Boundary values: exactly 8 via stops · exactly 2 attachments · PAX equal to vehicle capacity · deadline exactly at planned start · a trip starting in exactly 24 h · an invoice decided exactly 90 days ago | Inclusive limits are accepted; the next value is refused; the 24-hour flag and the archive rule use strict comparison | "You can add up to 8 via stops." (on the 9th) | Values at the limit are stored; beyond the limit nothing is stored | AC-ACT-08.1, AC-INV-01.1, AC-REQ-08.2 |
| ES-32 | FEAT-10 (FR-018) | A TEQ trip that is already shared via BusNetwork is shared again | Blocked, with a link to the existing network trip (**WA-30 / PQ-22**) | "TEQ trip 48213 is already shared via BusNetwork (trip 48213)." | No second network trip created | AC-REQ-09.1 |

### 12.4 Empty states, missing data and conflicting data

| ID | Feature (FR) | Scenario and trigger | Expected system behaviour | User-facing message | Data / state impact | Related AC |
|---|---|---|---|---|---|---|
| ES-11 | FEAT-14, FEAT-32 | A Requested trip's planned start passes with no deadline set | The deadline defaults to the planned start, so expiry applies (**WA-10 / PQ-10**) | "Trip 48213 was rejected: expired with no response." | Trip Rejected · "Expired"; requests `EXPIRED` | AC-REQ-08.1 |
| ES-12 | FEAT-26 (FR-067) | The nightly check finds the network trip differs from the TEQ trip | A consistency flag is raised on the detail page for both companies, for visible fields only; nothing is overwritten | "This trip differs from the TEQ trip: planned start 08:00 vs 08:30 (checked 02:00)" | Flag record created; trip data untouched | AC-CONS-01.1 |
| ES-14 | FEAT-03 (FR-041) | A shared URL contains a filter value the opener may not use | The value is dropped and the rest of the view is applied | "Some filters were removed." | No data disclosed | AC-LST-06.1 |
| ES-22 | FEAT-18 (FR-038, FR-042) | Host and partner are in different time zones | Each sees times in their own zone and filters by their own days | — | Stored times unchanged (UTC) | AC-LST-03.1, AC-LST-07.1 |
| ES-31 | FEAT-12, FEAT-18 | A company new to BusNetwork has no partners and no trips | Every list and picker shows its "nothing yet" state with the next step | "No accepted partners yet. Partnerships are set up in BusNetwork Settings." · "No trips yet." | None | AC-LST-08.1, AC-REQ-03.1 |

### 12.5 Failures, partial failures and refresh

| ID | Feature (FR) | Scenario and trigger | Expected system behaviour | User-facing message | Data / state impact | Related AC |
|---|---|---|---|---|---|---|
| ES-09 | FEAT-12, FEAT-15 | An affiliation stops being accepted between step 2 and submit | Submit is refused for that partner | "Your partnership with {partner} is no longer active. Remove the partner to continue." | No trip created | AC-REQ-03.1 |
| ES-10 | FEAT-49 (FR-106) | A scheduler job runs late | Statuses update when the job catches up; the detail page never shows a status the scheduler has not set; monitoring alerts after 5 minutes | — | Transitions applied exactly once on recovery | AC-SCHED-01.1, AC-PLAT-01.1 |
| ES-15 | FEAT-18, FEAT-28 | A row's status changes while the list is open | After the user's own action the row leaves with a toast and a link; other users' changes appear on the next refresh | "Trip 48213 moved to Closed Trips." | List state refreshed; no stale action possible (guards re-checked) | AC-ACT-05.1 |
| ES-18 | FEAT-43 (FR-099) | A notification fails to send | Retried and logged; the action that caused it stands | — | Delivery attempts recorded per channel | AC-NOTIF.1 |
| ES-26 | FEAT-03, FEAT-11 | The user reloads the browser mid-task | List and dashboard state is rebuilt from the URL; an unsaved request form offers the draft it last saved, or prompts to save one | "Continue where you left off?" | Nothing lost that was saved; unsaved form input is not a stored record | AC-LST-06.1, AC-REQ-02.1 |
| ES-27 | FEAT-51 (FR-108) | An integration is unavailable (Maps, TEQ Sales, Company Settings, BusNetwork Settings, S3, Bus Network service) | The dependent function fails with a specific message and a Retry; unrelated parts of the page still work; no action is half-applied | "TEQ Sales is unavailable — try again." · "Partner list unavailable." · "We couldn't create the invoice: company settings are unavailable." | Nothing partially written (DR-05) | AC-PLAT-01.1 |
| ES-28 | FEAT-15 (FR-030, FR-031) | The trip is created but the TEQ back-link cannot be written | The whole submit is refused rather than leaving the two systems disagreeing | "We couldn't link this to TEQ trip 48213. Nothing was shared — try again." | No network trip created | AC-REQ-09.1 |

---

## 13. User journeys

Eight end-to-end journeys, one or more per persona, each showing the screens it passes through. UJ IDs are shared with the UX package (`EXPERIENCE.md`).

### UJ-01 — Share a trip with two partners

| | |
|---|---|
| **Persona** | P-SALES (Ingrid, host) |
| **Goal** | Hand a trip her fleet cannot run to a partner, at the right price, today |
| **Entry point** | *Sales › Network Trips* → **Share** on a normal trip (or the Request tab) |
| **Screens** | S-02.1 → S-02.2 → S-02.3 → S-02.4 → S-02.6 → S-03 |

| Step | Decision | System response |
|---|---|---|
| 1. The request form opens prefilled from TEQ trip 48213 | Are the route, times and PAX right? | Banner "Prefilled from TEQ trip 48213. Check the details before sharing." |
| 2. Checks details, adds a comment to the partner, presses Next | — | Step 1 validates; Next is enabled only when required fields are valid (AC-REQ-01.1) |
| 3. Step 2 lists accepted affiliations with agreement and rate | Which partners? | Two partners selected; "2 partners selected" |
| 4. Step 3 shows customer price 20 000, partner A (85%) 17 000,00, partner B (full day) 16 500,00 | Override B? Set a deadline? | B overridden to 16 800,00 with "Overridden by Ingrid Hansen"; deadline accepted because it is before planned start |
| 5. Step 4 review → **Submit request** | — | Trip created as **Requested**, one share request per partner; success screen with Trip ID 48213 |
| **Success outcome** | The trip is Requested, both partners are notified (N-01, in-app + email + push), and the TEQ trip shows "Shared via BusNetwork · 48213" | | |
| **Failure / alternative paths** | An affiliation lapsed → ES-09 · a partner without an agreement → price 0 blocks submit (ES-08) · TEQ back-link fails → submit refused (ES-28) · interruption → Save draft (US-016) · the TEQ trip was already shared → ES-32 | | |

### UJ-02 — Accept a request; the other partner is withdrawn

| | |
|---|---|
| **Persona** | P-PCOORD (Lars, partner A; Magnus, partner B) |
| **Goal** | Win work that fits the fleet, before anyone else does |
| **Entry point** | Dashboard figure "Awaiting response", the nav badge, or the N-01 notification |
| **Screens** | S-01 → S-03 → S-06 → S-09 (Accept) → S-03 |

| Step | Decision | System response |
|---|---|---|
| 1. Lars sees "Awaiting response 3" and selects it | — | Active Trips opens filtered to Requested · received (AC-DSH-02.1) |
| 2. Opens the trip and reads route, schedule, PAX and his own offer price | Can we run it at this price? | Partner view omits the customer price and the other partner's price (BR-04) |
| 3. Chooses **Accept** | Confirm in the dialog? | Trip → **Accepted**; Ingrid notified (N-02); Magnus's request withdrawn and he is notified (N-03) |
| 4. Chooses **Create quotation in TEQ** | — | TEQ Sales opens with the trip prefilled in Lars's own account; the shared Trip ID is unchanged |
| **Success outcome** | One partner holds the trip; both companies see status **Accepted**; the host knows within seconds | | |
| **Failure / alternative paths** | Magnus accepts a moment later → "Already taken" (ES-01) · the deadline passed → ES-02 · Ingrid cancelled or removed him → ES-03 · Ingrid edited the trip meanwhile → "Details changed — review before accepting" (ES-04) | | |

### UJ-03 — Reject a request with a reason

| | |
|---|---|
| **Persona** | P-PCOORD (Magnus, partner B) |
| **Goal** | Decline work he cannot run, without leaving the host guessing |
| **Entry point** | Dashboard "Needs your action" or Active Trips |
| **Screens** | S-01 → S-03 → S-09 (Reject) → S-04 |

| Step | Decision | System response |
|---|---|---|
| 1. Opens a received Requested trip | Can we cover it? | Actions Accept · Reject offered (FR-069) |
| 2. Chooses **Reject** | Which reason? | Reason list; *Other* requires free text (AC-ACT-05.1) |
| 3. Confirms | — | Magnus's company sees the trip as **Rejected** with his reason; toast "Trip 48213 rejected. It's now in Closed Trips." |
| **Success outcome** | The host can re-share immediately and knows why; the host's trip stays **Requested** while another partner is pending, and becomes **Rejected** when the last one declines | | |
| **Failure / alternative paths** | No reason given → cannot confirm · the request was already withdrawn or expired → ES-03, ES-02 | | |

### UJ-04 — Cancel an accepted trip

| | |
|---|---|
| **Persona** | P-SALES (Ingrid, host) |
| **Goal** | Stop a trip the customer has cancelled, so the partner does not send a bus |
| **Entry point** | Active Trips or the trip detail page |
| **Screens** | S-03 → S-06 → S-09 (Cancel) → S-04 |

| Step | Decision | System response |
|---|---|---|
| 1. Opens the Accepted trip | — | Actions Cancel · Comment offered |
| 2. Chooses **Cancel** | Which reason? Is the start within 24 h? | Reason required; the dialog warns that an SMS will also be sent if the trip starts within 24 h |
| 3. Confirms | — | Status **Cancelled**; the trip moves from Active to Closed (BR-01); the partner is notified in-app, by email, and by SMS when applicable |
| **Success outcome** | Both companies see **Cancelled** with the reason; the trip is in Closed Trips and can never be invoiced (BR-06) | | |
| **Failure / alternative paths** | The trip is already In progress → cancelling is not possible (ES-05, **PQ-08**) · the trip is already closed → ES-06 | | |

### UJ-05 — The trip runs and completes

| | |
|---|---|
| **Persona** | System (TEQ Scheduler) with P-PCOORD (Lars) |
| **Goal** | Keep the status true to what is happening on the road, without manual updates |
| **Entry point** | Time, or **Mark complete** on the trip |
| **Screens** | S-03 → S-06 → S-04 |

| Step | Decision | System response |
|---|---|---|
| 1. The planned start is reached | — | Scheduler sets **In progress** within 5 minutes, with a "System" history entry |
| 2. The trip finishes early | Mark complete now, or wait for the planned end? | Lars chooses **Mark complete**; otherwise the scheduler completes it at the planned end (**Q5**) |
| 3. The trip becomes Completed | — | `closed_at` set; the trip appears in Closed Trips with Invoice = "Not invoiced" |
| **Success outcome** | The trip is Completed and ready to invoice; no one had to update a list | | |
| **Failure / alternative paths** | The scheduler is late → statuses catch up and monitoring alerts (ES-10) · a fixed trip's start and end come from the first and last sub-trips (**WA-09**) | | |

### UJ-06 — Invoice a completed trip

| | |
|---|---|
| **Persona** | P-FIN (Olav, partner finance) |
| **Goal** | Bill the completed trip quickly and correctly |
| **Entry point** | Closed Trips with the "Completed, not invoiced" filter, or the trip detail page |
| **Screens** | S-04 → S-08 → S-09 (Submit) → S-07 |

| Step | Decision | System response |
|---|---|---|
| 1. Filters Closed Trips by **Completed, not invoiced** | Which trips still need billing? | Only Completed, received trips with no active invoice are listed (AC-CLS-07.1) |
| 2. Chooses **Create invoice** | — | A **Draft** opens, numbered `BN-INV-2026-000184`, prefilled with the agreed offer price and the ferry cost, VAT from company settings |
| 3. Adds a waiting-time line (2 × 450 at 25%) | Anything else to bill? | Line net 900,00 and VAT 225,00; totals update |
| 4. Chooses **Submit** | — | Status **Pending**; host finance notified (N-07); the host's badge and dashboard figure increase |
| **Success outcome** | The host has an invoice that matches what was agreed, within minutes of completion (OBJ-3) | | |
| **Failure / alternative paths** | The trip is not Completed or already has an active invoice → ES-07 · Company Settings unavailable → creation blocked (ES-27) · a line without a description → cannot be saved · a Draft never sent can be deleted (FR-095) | | |

### UJ-07 — Approve or decline an incoming invoice

| | |
|---|---|
| **Persona** | P-FIN (Sofie, host finance) |
| **Goal** | Pay what was agreed, and challenge what was not |
| **Entry point** | Dashboard "Open invoices" or the Invoice List badge |
| **Screens** | S-01 → S-07 → S-08 → S-09 (Approve / Decline) |

| Step | Decision | System response |
|---|---|---|
| 1. Opens *Invoice List › Incoming*, filtered to Pending | — | Pending invoices with amounts, trip link and customer column (host only) |
| 2. Opens the invoice and compares it with the trip | Does it match what we agreed? | Lines, VAT and totals shown against the trip reference |
| 3a. **Approve** | — | Amounts lock (snapshot); partner finance notified; the figure and badge drop |
| 3b. **Decline** | Which reason? | Reason required; partner finance notified; Olav edits and resubmits as v2 |
| **Success outcome** | Settlement is decided in the portal, with the decision, the decider and the amounts recorded for five years | | |
| **Failure / alternative paths** | Decline without a reason → refused (ES-19) · the trip's price changes later → the approved invoice is unaffected (AC-INV-07.1) · two concurrent resubmissions → one new version (ES-20) |

### UJ-08 — Monitor the network and export a period

| | |
|---|---|
| **Persona** | P-VIEW (Management) |
| **Goal** | Report on last quarter without asking an operator |
| **Entry point** | Dashboard |
| **Screens** | S-01 → S-05 → export |

| Step | Decision | System response |
|---|---|---|
| 1. Reads the figures and the 12-week volume chart | Which period? | Period selector changes the period figure and charts (R1.1) |
| 2. Opens All Trips, ticks the "Closed" group and sets last quarter's dates | — | Count line "412 trips (Active 37 · Closed 375)"; the count equals Closed Trips with the same filters (AC-ALL-03.1) |
| 3. Chooses **Export XLSX** | — | Every matching row plus the status history of each trip, with the time zone named |
| **Success outcome** | A report built from the same numbers the operators see, with no action ever offered to a read-only user | | |
| **Failure / alternative paths** | More than 50 000 rows → narrow the filters (ES-21) · fields outside the user's scope are never exported (AC-SCOPE.1) | | |

### 13.1 Journey → screen → workflow map

| Journey | Personas | Screens in order | Stories |
|---|---|---|---|
| UJ-01 | P-SALES | S-02.1 → S-02.2 → S-02.3 → S-02.4 → S-02.6 → S-03 | US-014…US-023, US-026 |
| UJ-02 | P-PCOORD | S-01 → S-03 → S-06 → S-09 → S-03 | US-005, US-008, US-043, US-044 |
| UJ-03 | P-PCOORD | S-01 → S-03 → S-09 → S-04 | US-008, US-045 |
| UJ-04 | P-SALES | S-03 → S-06 → S-09 → S-04 | US-029, US-046 |
| UJ-05 | System, P-PCOORD | S-03 → S-06 → S-04 | US-047, US-048 |
| UJ-06 | P-FIN | S-04 → S-08 → S-09 → S-07 | US-032, US-053, US-054, US-055 |
| UJ-07 | P-FIN | S-01 → S-07 → S-08 → S-09 | US-009, US-056, US-057, US-058 |
| UJ-08 | P-VIEW | S-01 → S-05 → export | US-010, US-013, US-028, US-033 |

---

## 14. Screen inventory

Screen IDs are shared with the UX package (`SCREENS.md`), which holds the layouts; this inventory is the product definition each screen must satisfy. Every screen lists its states, including the permission-restricted state, so a prototype or build can be assembled from this section alone.

### S-00 — Portal shell and navigation

| | |
|---|---|
| **Module** | MOD-01 |
| **Purpose** | One entry point to the whole exchange, showing only what the user may open and what is waiting on them |
| **Primary persona** | All |
| **Entry point** | Any BusNetwork URL; the TEQ product switcher |
| **Main components** | TEQ top bar (product switcher, company name and switcher, notification bell with unread count, user menu with language and time zone); BusNetwork navigation bar with six tabs and badges |
| **Primary actions** | Open a tab; open the notifications panel |
| **Secondary actions** | Switch company; change language or time zone; sign out |
| **Navigation** | To S-01…S-08 by tab; to S-10 from the bell |
| **Related features** | FEAT-01, FEAT-02, FEAT-03 |
| **Related user stories** | US-001, US-002, US-003 |
| **States** | *Default:* tabs and badges rendered · *Loading:* badge placeholders · *Empty:* no badge when a count is zero · *Error:* badge omitted, navigation still usable · *Success:* — · *Permission restricted:* tabs the user cannot open are absent, not disabled |
| **Related business rules** | BR-09 |

### S-01 — Dashboard

| | |
|---|---|
| **Module** | MOD-02 |
| **Purpose** | Answer what needs my action now, what is running soon, and how the network is doing |
| **Primary persona** | All; content varies by role |
| **Entry point** | Landing page after sign-in; the Dashboard tab |
| **Main components** | Period selector; "Updated HH:MM" with Refresh; five key-figure tiles; *Upcoming trips* table; *Needs your action* (or *Recent activity* for read-only roles); *Trip volume* chart with table view; *Top partners* |
| **Primary actions** | Open a key figure's filtered list; open a trip or invoice from a widget |
| **Secondary actions** | Change period; refresh; "View all" from a widget |
| **Navigation** | To S-03, S-04, S-06, S-07, S-08 |
| **Related features** | FEAT-04, FEAT-05, FEAT-06, FEAT-07, FEAT-08 |
| **Related user stories** | US-005…US-013 |
| **States** | *Default:* figures and widgets rendered · *Loading:* skeleton tiles and widgets · *Empty:* tiles show "0"; widgets show "Nothing waiting on you" / "No upcoming trips" · *Error:* per-widget error with Retry, the rest of the page still renders · *Success:* an action taken elsewhere is reflected within 5 minutes · *Permission restricted:* figures that lead to a hidden list are not links; read-only roles see *Recent activity* and no action buttons |
| **Related business rules** | BR-01, BR-04, BR-09; BN-DSH-08 freshness |

### S-02 — Request (four steps, drafts, success)

| | |
|---|---|
| **Module** | MOD-03 |
| **Purpose** | Create a trip and share it with one or more partners at a price taken from each agreement |
| **Primary persona** | P-SALES, P-ADMIN |
| **Entry point** | Request tab; **Share** on a TEQ trip (`source=`); a saved draft (`draft=`) |
| **Main components** | Stepper (1–4); step content; footer bar with Save draft · Back · Next / Submit; prefill banner; validation summary |
| **Primary actions** | Next; Submit request; Quick share (Later) |
| **Secondary actions** | Back; Save draft; Edit from the review step; Create another request |
| **Navigation** | To S-03 after submit; to S-06 from the success screen |
| **Related features** | FEAT-09, FEAT-10, FEAT-11, FEAT-12, FEAT-13, FEAT-14, FEAT-15, FEAT-16, FEAT-17 |
| **Related user stories** | US-014…US-026 |
| **States** | *Default:* blank or prefilled step 1 · *Loading:* prefill skeleton · *Empty:* no accepted partners on step 2, with a pointer to BusNetwork Settings · *Error:* field-level messages plus a summary; dependency banner when Maps, TEQ Sales or BusNetwork Settings is unavailable; submit refused when an affiliation ended · *Success:* confirmation with Trip ID and links · *Permission restricted:* the whole screen is unavailable without *Create / share request* |
| **Related business rules** | BR-02, BR-05, BR-07, BR-08 |

| Sub-screen | Purpose | Key components | Primary action |
|---|---|---|---|
| S-02.1 Step 1 · Trip details | Capture the trip | Trip type and round trip; customer and contact; route with via stops and map; schedule; PAX and vehicle; shifts (fixed); references; comment fields; attachments | Next |
| S-02.2 Step 2 · Select partners | Choose who is offered the trip | Search, name sort, table of accepted affiliations with category, agreement and rate, multi-select | Next |
| S-02.3 Step 3 · Set price | Set what each partner is offered | Customer price; read-only currency; response deadline; per-partner row with agreement, calculated price, editable offer price, override marker and additional costs | Next |
| S-02.4 Step 4 · Review & submit | Confirm before sharing | Read-only summary cards with Edit links | Submit request |
| S-02.5 Drafts | Resume unfinished work | "My drafts" table: last edited, type, route, step; Open, Delete | Open |
| S-02.6 Success | Close the loop | Trip ID, partner count, TEQ back-link confirmation | Open in Active Trips |

### S-03 — Active Trips

| | |
|---|---|
| **Module** | MOD-04 |
| **Purpose** | The working list of open trips: Requested, Accepted, In progress |
| **Primary persona** | P-SALES, P-PCOORD (all roles may view) |
| **Entry point** | Active Trips tab; Dashboard figures; notification deep links |
| **Main components** | Title with total; S-11 toolbar; direction segmented control; status multi-select; table with standard columns; "Starts < 24 h" flag; bulk-selection bar (Later) |
| **Primary actions** | Accept · Reject (received, Requested); Edit · Cancel (shared, Requested); Cancel · Comment (Accepted); Mark complete · Comment (In progress) |
| **Secondary actions** | Search, filter, sort, page, export; open a row |
| **Navigation** | To S-06, S-09 |
| **Related features** | FEAT-18, FEAT-19, FEAT-20, FEAT-28 |
| **Related user stories** | US-029, US-030, US-027, US-028, US-035, US-051 |
| **States** | *Default:* rows with actions for status, side and role · *Loading:* skeleton rows · *Empty (filtered):* "No active trips match these filters." + Clear filters · *Empty (none):* "No active trips right now." + Create a request for roles that may · *Error:* banner with Retry · *Success:* toast "Trip 48213 moved to Closed Trips." after an action · *Permission restricted:* no action buttons for roles without them; the tab is hidden for roles without trip-view rights |
| **Related business rules** | BR-01, BR-04, BR-07, BR-09 |

### S-04 — Closed Trips

| | |
|---|---|
| **Module** | MOD-04 |
| **Purpose** | Review finished trips and start settlement |
| **Primary persona** | P-FIN, P-PCOORD |
| **Entry point** | Closed Trips tab; Dashboard "Closed this month"; the Invoice column on other lists |
| **Main components** | S-11 toolbar; status multi-select; direction; closed-date range; "Completed, not invoiced" chip; table with Closed date and Invoice columns; truncated reason with full text on hover or focus |
| **Primary actions** | Create invoice (Completed, received, Finance/Admin); View invoice; Comment |
| **Secondary actions** | Filter, sort, page, export; open a row |
| **Navigation** | To S-06, S-08 |
| **Related features** | FEAT-18, FEAT-19, FEAT-21, FEAT-36 |
| **Related user stories** | US-031, US-032, US-053 |
| **States** | *Default:* read-only rows with invoice actions · *Loading:* skeleton rows · *Empty (filtered):* "No closed trips match these filters." + Clear filters · *Empty (none):* "No closed trips yet." · *Error:* banner with Retry · *Success:* invoice created and opened · *Permission restricted:* Create invoice hidden without invoice rights; invoice status shown without a link |
| **Related business rules** | BR-01, BR-06, BR-07 |

### S-05 — All Trips

| | |
|---|---|
| **Module** | MOD-04 |
| **Purpose** | Search, report and check history across every status |
| **Primary persona** | P-VIEW, P-ADMIN |
| **Entry point** | All Trips tab |
| **Main components** | S-11 toolbar; grouped status filter (Active / Closed with group headings); direction; column chooser (Later); count line "412 trips (Active 37 · Closed 375)"; full column set |
| **Primary actions** | The same row actions as S-03 / S-04 for the row's status |
| **Secondary actions** | Filter, sort, page; export with status history; choose columns |
| **Navigation** | To S-06, S-08 |
| **Related features** | FEAT-18, FEAT-19, FEAT-22 |
| **Related user stories** | US-033, US-034, US-028 |
| **States** | *Default:* all six statuses · *Loading:* skeleton rows · *Empty (filtered):* "No trips match these filters." + Clear filters · *Empty (none):* "No trips yet." · *Error:* banner with Retry · *Success:* export downloaded · *Permission restricted:* actions follow the role, exactly as on the other lists |
| **Related business rules** | BR-01, BR-09 |

### S-06 — Trip detail

| | |
|---|---|
| **Module** | MOD-05 |
| **Purpose** | Everything about one trip, for the company viewing it, with the actions that fit its status |
| **Primary persona** | All |
| **Entry point** | Any list row; dashboard widgets; notification deep links |
| **Main components** | Header (Back to list, Trip ID, status pill with reason, type, host → partner, actions); banners (consistency flag, closed read-only, price-change proposal); route and map; schedule; passengers and vehicle; shifts; pricing; customer and references; comment fields; attachments; history timeline with filter chips; side panel (status with next automatic change, partner responses, invoice, comment thread and composer) |
| **Primary actions** | The action matrix for the trip's status, side and role; post a comment; propose or confirm a price change; set an alternative start address |
| **Secondary actions** | Download an attachment; filter history; open the invoice; back to list |
| **Navigation** | To S-09 dialogs, S-08 invoice, back to S-03 / S-04 / S-05 |
| **Related features** | FEAT-23, FEAT-24, FEAT-25, FEAT-26, FEAT-27, FEAT-28 |
| **Related user stories** | US-037…US-042, US-043…US-047, US-050 |
| **States** | *Default:* full detail for the viewing company · *Loading:* section skeletons · *Empty:* no comments yet ("No comments yet"); no attachments · *Error:* "Trip not found." (including out of scope); map unavailable → addresses without a map · *Success:* action confirmation toast and updated status pill · *Permission restricted:* host-only fields absent for a partner; no actions for read-only roles; closed trips show the read-only banner |
| **Related business rules** | BR-01, BR-04, BR-05, BR-09 |

### S-07 — Invoice List

| | |
|---|---|
| **Module** | MOD-07 |
| **Purpose** | See and decide on invoices between the two companies |
| **Primary persona** | P-FIN, P-ADMIN |
| **Entry point** | Invoice List tab; Dashboard "Open invoices"; notification deep links |
| **Main components** | Sub-tabs Incoming (badge) · Outgoing · Archive; S-11 toolbar with status, company, trip date and invoice date filters; invoice columns including Customer (host only); footer totals |
| **Primary actions** | Approve · Decline (incoming Pending); Submit (outgoing Draft); Edit & resubmit (Declined) |
| **Secondary actions** | View; Download PDF; delete a Draft; filter, sort, page, export |
| **Navigation** | To S-08, S-09, S-06 (trip link) |
| **Related features** | FEAT-40, FEAT-38, FEAT-41, FEAT-42 |
| **Related user stories** | US-059, US-056, US-057, US-009 |
| **States** | *Default:* rows with actions for status and side · *Loading:* skeleton rows · *Empty (filtered):* "No incoming invoices match these filters." + Clear filters · *Empty (none):* "No invoices yet. Invoices are created from Completed trips." · *Error:* banner with Retry · *Success:* decision toast; badge and totals update · *Permission restricted:* the tab is hidden without invoice rights; the Customer column is absent for a partner |
| **Related business rules** | BR-04, BR-06, BR-08 |

### S-08 — Invoice (view / edit)

| | |
|---|---|
| **Module** | MOD-07 |
| **Purpose** | Build, send and decide on a single invoice |
| **Primary persona** | P-FIN, P-ADMIN |
| **Entry point** | S-07 row; *Create invoice* on S-04 or S-06; notification deep link |
| **Main components** | Header (invoice no., version switcher, status pill, direction, trip link, issuer → recipient); party cards with address, org no. and VAT no.; line table with net and VAT per line and totals; invoice comment and reference from the trip; decision block with decided by, at, reason and the "amounts locked" note |
| **Primary actions** | Save · Submit · Delete draft (partner, Draft); Approve · Decline (host, Pending); Edit & resubmit (partner, Declined) |
| **Secondary actions** | Add or remove a line; download PDF; switch version; open the trip |
| **Navigation** | To S-09 dialogs; back to S-07; to S-06 |
| **Related features** | FEAT-36, FEAT-37, FEAT-38, FEAT-39, FEAT-41, FEAT-42 |
| **Related user stories** | US-053…US-058, US-060 |
| **States** | *Default:* read-only or editable by status and side · *Loading:* skeleton · *Empty:* a new Draft always has at least the prefilled offer-price line · *Error:* "Invoice not found."; line validation messages; refusal when the trip already has an active invoice · *Success:* submitted, approved or declined confirmation · *Permission restricted:* no edit or decision controls without the matching role and side; a decided invoice is read-only for everyone |
| **Related business rules** | BR-04, BR-06, BR-08; BN-INV-07 |

### S-09 — Dialogs

| | |
|---|---|
| **Module** | MOD-06, MOD-07 |
| **Purpose** | Confirm an action, capture a required reason, and report the outcome |
| **Primary persona** | P-SALES, P-PCOORD, P-FIN, P-ADMIN |
| **Entry point** | An action button on S-03, S-04, S-05, S-06, S-07 or S-08 |
| **Main components** | Accept (trip summary and withdrawal warning); Reject (reason list + Other); Cancel (reason list + SMS warning); Mark complete; Bulk accept / reject (Later); Propose price change (current price, new price, required comment); Submit invoice; Approve invoice (locking note); Decline invoice (reason list) |
| **Primary actions** | The named confirmation, e.g. "Accept trip 48213" |
| **Secondary actions** | Cancel the dialog (Esc); read the trip or invoice behind it |
| **Navigation** | Returns to the originating screen with focus restored to the trigger |
| **Related features** | FEAT-29, FEAT-30, FEAT-31, FEAT-34, FEAT-27, FEAT-38 |
| **Related user stories** | US-043…US-047, US-051, US-042, US-055…US-057 |
| **States** | *Default:* focus on the first field · *Loading:* button progress while committing · *Empty:* — · *Error:* in-dialog refusal (Already taken · Expired · Cancelled by host · reason required) · *Success:* dialog closes and the originating screen shows a toast · *Permission restricted:* the dialog is unreachable because the action is not offered, and the API refuses it |
| **Related business rules** | BR-03, BR-05, BN-ACT-05, BN-INV-06 |

### S-10 — Notifications panel

| | |
|---|---|
| **Module** | MOD-08 |
| **Purpose** | Show what has happened that concerns the user, and let them get to it |
| **Primary persona** | All |
| **Entry point** | The bell in the TEQ top bar |
| **Main components** | Tabs *Unread* / *All*; items with icon, text, relative time and deep link; "Mark all read"; link to notification settings |
| **Primary actions** | Open the trip or invoice behind an item |
| **Secondary actions** | Mark all read; open settings (per-event channels, daily summary) |
| **Navigation** | To S-06, S-08; to settings |
| **Related features** | FEAT-43, FEAT-44 |
| **Related user stories** | US-061, US-062 |
| **States** | *Default:* newest first with unread marked · *Loading:* skeleton items · *Empty:* "Nothing new." · *Error:* "Couldn't load notifications" with Retry · *Success:* item read state updates and the bell count drops · *Permission restricted:* items only ever concern objects in the user's scope |
| **Related business rules** | BR-04, BR-09 |

### S-11 — Shared list component *(pattern, not a page)*

| | |
|---|---|
| **Module** | MOD-04 |
| **Purpose** | One list behaviour for S-03, S-04, S-05 and S-07 |
| **Primary persona** | All |
| **Entry point** | Embedded in the four list screens |
| **Main components** | Title with total; search box; trip-start date range; company filter; list-specific filters; active-filter chips with Clear filters; sortable column headers; rows; pager with rows-per-page; Export menu |
| **Primary actions** | Search, filter, sort, page, export, open a row |
| **Secondary actions** | Clear filters; change page size; copy the URL |
| **Navigation** | To the relevant detail screen, with the list URL as the return target |
| **Related features** | FEAT-18, FEAT-19, FEAT-03 |
| **Related user stories** | US-027, US-028, US-035, US-036, US-004 |
| **States** | *Default:* rows and total · *Loading:* skeleton rows, filters still usable · *Empty:* the two empty variants with Clear filters · *Error:* banner with Retry, filters preserved · *Success:* export ready · *Permission restricted:* out-of-scope filter values dropped with "Some filters were removed" |
| **Related business rules** | BR-04, BR-07, BR-09 |

### S-12 — Visibility rules *(cross-screen specification)*

| | |
|---|---|
| **Module** | MOD-09 |
| **Purpose** | State, in one place, what each side may see, so no screen has to decide for itself |
| **Primary persona** | All (enforced server-side) |
| **Entry point** | Applies to S-01…S-11 and every export, PDF and notification |
| **Main components** | Host-only fields; fields shown to both companies; fields a partner sees only about itself; department scope |
| **Primary actions** | — |
| **Secondary actions** | — |
| **Navigation** | — |
| **Related features** | FEAT-47, FEAT-46 |
| **Related user stories** | US-063, US-064 |
| **States** | *Permission restricted* is the whole subject: a field the viewer may not see is absent, never blanked or masked |
| **Related business rules** | **BR-04**, **BR-09**, NFR-05 |

### S-13 — State catalogue *(cross-screen specification)*

| | |
|---|---|
| **Module** | All |
| **Purpose** | Guarantee that every screen has a defined loading, empty, error, success and restricted state |
| **Primary persona** | All |
| **Entry point** | Applies to every screen above |
| **Main components** | Skeletons; empty-state texts with a next step; error banners with Retry; toasts; read-only banners |
| **Primary actions** | Retry; Clear filters; the next step offered by an empty state |
| **Secondary actions** | — |
| **Navigation** | — |
| **Related features** | FEAT-08, FEAT-18, FEAT-51 |
| **Related user stories** | US-036, US-012, US-067 |
| **States** | The catalogue itself: each screen's five states are listed in its own entry above and must be implemented and tested |
| **Related business rules** | BN-LST-08, BN-DSH-08 |

---

## 15. Prioritization — MoSCoW

### 15.1 Method

Priorities are **not set by this PRD**. Every functional requirement carries the MoSCoW value BN-BRD-001 §9 gives it; a feature takes the highest value among its requirements; *Won't Have* is exactly the BRD §4 out-of-scope list. The release slices follow: **Must → R1**, **Should → R1.1**, **Could → Later**. Where the PRD has an opinion about sequence, it is stated as a recommendation (§15.6), not as a changed priority.

### 15.2 Must Have — R1

| ID | Feature / requirement | Priority | Reason | Dependencies |
|---|---|---|---|---|
| FEAT-01 | Six-tab navigation (BRD §7) | Must | The portal's premise: one place to work (OBJ-4) | FEAT-45 |
| FEAT-02 | Action badges (BN-INV-08, BRD §7) | Must | Work that is waiting must be visible without opening a tab (OBJ-2) | FEAT-18, FEAT-40 |
| FEAT-03 | Deep-linkable routes (BN-DSH-02, BN-LST-10) | Must | Dashboard figures and list returns depend on stable routes | — |
| FEAT-04 | Key figures and deep links (BN-DSH-01/02) | Must | Answers "what needs my action now" — the fix for PB-2 | FEAT-18, FEAT-35 |
| FEAT-05 | Upcoming trips (BN-DSH-03) | Must | Answers "what is running soon" | FEAT-23 |
| FEAT-06 | Needs your action (BN-DSH-04) | Must | The queue that keeps requests from expiring (OBJ-2) | FEAT-24, FEAT-38 |
| FEAT-08 | Data freshness (BN-DSH-08) | Must | Figures nobody trusts are worse than none (OBJ-5) | FEAT-49 |
| FEAT-09 | Four-step request form (BN-REQ-01, 10) | Must | Without it nothing can be shared | Maps, TEQ Sales |
| FEAT-10 | Prefill and entry points (BN-REQ-01, 09) | Must | Sharing must start from the trip that already exists in TEQ | TEQ Sales |
| FEAT-12 | Partner selection (BN-REQ-03, 04) | Must | BR-02 is enforced here; multi-partner sharing is the core of OBJ-1 | BusNetwork Settings |
| FEAT-13 | Offer pricing (BN-REQ-05) | Must | A request without a price cannot be answered | Company Settings |
| FEAT-15 | Submission and share requests (BN-REQ-01, 04, 09) | Must | Creates the trip and the per-partner requests everything else reads | FEAT-12, FEAT-13 |
| FEAT-16 | Edit a requested trip (BN-ACT-04) | Must | Named in the BRD action list; avoids cancel-and-recreate | FEAT-15 |
| FEAT-18 | Shared list component (BN-LST-01…05, 07, 08, 10) | Must | Four screens depend on it; OBJ-5 lives or dies here | FEAT-35, FEAT-46 |
| FEAT-20 | Active Trips list (BN-ACT-01, 02, 03) | Must | The day-to-day working list | FEAT-18 |
| FEAT-21 | Closed Trips list (BN-CLS-01, 02, 03, 05) | Must | Where settlement starts (PB-4) | FEAT-18, FEAT-40 |
| FEAT-22 | All Trips list (BN-ALL-01, 02, 03) | Must | The reconciliation promise (BN-ALL-03, OBJ-5) | FEAT-18, FEAT-35 |
| FEAT-23 | Trip detail page (BN-DTL-01, 02, 03, 06) | Must | One trip end to end in one place (PB-1) | Maps, FEAT-28 |
| FEAT-24 | Comment threads (BN-DTL-04) | Must | The only channel between the two companies inside the portal | FEAT-43 |
| FEAT-25 | History log (BN-DTL-05) | Must | Required by NFR-04 and by every dispute | FEAT-48 |
| FEAT-26 | Consistency flag (BRD §14 risk) | Must | The BRD names it as the mitigation for a high-impact risk | FEAT-50 |
| FEAT-27 | Post-acceptance price change (BR-05) | Must | Without it BR-05 cannot be honoured in the portal | FEAT-24, FEAT-25 |
| FEAT-28 | Action matrix (BN-ACT-04, BN-DTL-06, BN-ALL-04) | Must | Guarantees the same action everywhere (OBJ-5) | FEAT-46 |
| FEAT-29 | Accept and first-accept-wins (BN-ACT-06, 07, BR-03) | Must | The moment the exchange exists for | FEAT-43 |
| FEAT-30 | Reject and cancel with reason (BN-ACT-05) | Must | Reasons are what let the host re-share quickly | FEAT-43 |
| FEAT-31 | Completion (BRD §7) | Must | Closed trips are the input to settlement (OBJ-3) | FEAT-49 |
| FEAT-33 | Closed immutability (BN-CLS-06) | Must | Settlement must rest on something that cannot move | FEAT-28 |
| FEAT-35 | Company-view status (BR-01) | Must | Makes BR-01 true when several partners answer separately | — |
| FEAT-36 | Invoice creation and prefill (BN-CLS-04, BN-INV-03, 04) | Must | Settlement starts from the trip (PB-4, OBJ-3) | FEAT-31 |
| FEAT-37 | Invoice lines and totals (BN-INV-05) | Must | An invoice that cannot reflect the real trip will not be used | FEAT-36 |
| FEAT-38 | Submit, approve, decline (BN-INV-06) | Must | The settlement decision itself | FEAT-43 |
| FEAT-39 | Versioning after decline (BRD §9.6) | Must | Named in the BRD status table; keeps the dispute history | FEAT-38 |
| FEAT-40 | Invoice List and archive (BN-INV-01, 02) | Must | Where finance works | FEAT-18 |
| FEAT-41 | Amount locking (BN-INV-07) | Must | Prevents amounts moving after a decision | FEAT-38 |
| FEAT-43 | Lifecycle notifications (BRD §11) | Must | Nothing in OBJ-1 or OBJ-2 works if people are not told | TEQ channels |
| FEAT-44 | Notification preferences (BRD §14) | Must | The BRD's own mitigation for notification fatigue | FEAT-43 |
| FEAT-45 | Authentication and session (NFR-03) | Must | Precondition for everything | TEQ login |
| FEAT-46 | Role and scope enforcement (BRD §5, BR-09) | Must | BR-09 and NFR-03 | TEQ permissions |
| FEAT-47 | Cross-company field visibility (BR-04, NFR-05) | Must | A leak here is a breach, not a defect | Data-sharing contract |
| FEAT-48 | Audit trail (NFR-04) | Must | Five-year obligation | — |
| FEAT-49 | Scheduled jobs (BRD §13) | Must | Three statuses and two notifications depend on them | TEQ Scheduler |
| FEAT-50 | Nightly consistency check (BRD §14) | Must | Mitigation for the highest-impact data risk | TEQ Sales |
| FEAT-51 | Integration resilience (BRD §13) | Must | Eight dependencies; silent failure would break trust in the lists | All integrations |
| FEAT-52 | Analytics instrumentation (OBJ-1…5) | Must | Without it no objective can be shown to be met | Analytics pipeline |
| FEAT-53 | Migration tooling (BRD §14) | Must | The BRD assumes a lossless move | Bus Network service |

### 15.3 Should Have — R1.1

| ID | Feature / requirement | Priority | Reason | Dependencies |
|---|---|---|---|---|
| FEAT-11 | Drafts (BN-REQ-02) | Should | Valuable but not required to share a trip | FEAT-09 |
| FEAT-14 | Response deadline (BN-REQ-08) | Should *(recommended R1 — §15.6)* | OBJ-2, N-05 and the only exit from an unanswered request depend on it | FEAT-32, FEAT-49 |
| FEAT-19 | List export (BN-LST-09, BN-ALL-06) | Should | Reporting matters, but lists work without it | FEAT-18, FEAT-48 |
| FEAT-32 | Expiry (BN-REQ-08) | Should *(recommended R1)* | Same reason as FEAT-14: it is the exit from Requested | FEAT-14 |
| FEAT-42 | Invoice PDF (BN-INV-09) | Should | Needed to hand settlement to accounting, which stays out of scope | Company Settings, S3 |
| FEAT-07 | Period selector and volume chart (BN-DSH-05, 06) | Should | Management insight; the figures work without a period switch | FEAT-04 |
| — | BN-LST-06 URL state | Should | Sharing a filtered view is a convenience, not a dependency | FEAT-03 |
| — | BN-REQ-06 additional costs | Should | Improves invoice accuracy; the offer price alone is billable | FEAT-13 |
| — | BN-ACT-08 "Starts < 24 h" flag | Should | Helps OBJ-2; the list is usable without it | FEAT-20 |
| — | BN-CLS-07 "Completed, not invoiced" | Should | Speeds OBJ-3; the same set can be found with filters | FEAT-21 |
| — | BN-INV-10 footer totals | Should | Finance convenience | FEAT-40 |

### 15.4 Could Have — Later

| ID | Feature / requirement | Priority | Reason | Dependencies |
|---|---|---|---|---|
| FEAT-17 | Quick share (BN-REQ-07) | Could | Only useful to companies with a fixed default partner; demand to be confirmed from R1 usage | FEAT-15, BusNetwork Settings |
| FEAT-34 | Bulk accept / reject (BN-ACT-09) | Could | Volume-dependent; single actions cover the workflow | FEAT-29, FEAT-30 |
| — | BN-DSH-07 top partners | Could | Reporting nicety; also waits on **Q7** | FEAT-07 |
| — | BN-ALL-05 column chooser | Could | Personalisation; the standard columns are the agreed set | FEAT-22 |

### 15.5 Won't Have — this release

Exactly BRD §4 *Out of scope*. Each stays where it is today; none is a candidate for R1 or R1.1.

| ID | Item | Priority | Reason | Dependencies / consequence |
|---|---|---|---|---|
| OOS-1 | Managing partner agreements and rates | Won't | Stays in *Planning › BusNetwork Settings*; the portal reads them | The portal never writes agreements; FEAT-12 and FEAT-13 are read-only consumers |
| OOS-2 | Assigning vehicles and drivers | Won't | Stays in Planning | The portal carries vehicle *requirements* only (FR-019) |
| OOS-3 | Posting invoices to accounting (Fortnox, SIE4) | Won't | Each company's accounting system | Settlement ends at Approved; PDF download bridges the gap (FEAT-42) |
| OOS-4 | Collecting and reconciling payments | Won't | Each company's finance | No *Paid* status; **Q2** would change this |
| OOS-5 | Customer-facing booking portal changes | Won't | Separate product surface | None |
| OOS-6 | Mobile driver app | Won't | Not planned | The portal is desktop-to-tablet only (NFR-014) |

### 15.6 Sequencing recommendation

**BN-REQ-08 (response deadline) is *Should*, but three Must-level things depend on it:** OBJ-2 (fewer unanswered requests), the "Request expiring in 2 h" notification in BRD §11, and the only exit from **Requested** when nobody answers (PQ-10, risk RP-3). **Recommendation to the Product Owner:** pull FEAT-14 and FEAT-32 into R1. This is a sequencing recommendation, not a priority change: the BRD's MoSCoW value stands until the Product Owner decides.

### 15.7 Release slices

| Slice | Contents | Count | Gate |
|---|---|---|---|
| **R1** | Every *Must* requirement | 50 BRD requirements · 45 features | Blocking questions answered or accepted as working assumptions: PQ-01, PQ-02, PQ-04, PQ-10, PQ-15 (and PQ-13 for finance); BRD Q3 and Q4 answered before estimation, since they change the state machine |
| **R1.1** | Every *Should* requirement: BN-LST-06, BN-LST-09, BN-DSH-05, BN-DSH-06, BN-REQ-02, BN-REQ-06, BN-REQ-08, BN-ACT-08, BN-CLS-07, BN-ALL-06, BN-INV-09, BN-INV-10 | 12 | R1 live |
| **Later** | Every *Could* requirement: BN-DSH-07, BN-REQ-07, BN-ACT-09, BN-ALL-05 | 4 | Demand confirmed from R1 usage; **Q7** answered for BN-DSH-07 |

---

## 16. Traceability matrix

The **BR ID** column holds the business requirement from BN-BRD-001 (§8–§9); the **Business rule** column holds the rule from BRD §10 that constrains it. Screens are `SCREENS.md` IDs.

### 16.1 Business requirement → module → feature → FR → epic → story → acceptance → rule → screen → priority

| BR ID | Module | Feature | FR | Epic | Story | Acceptance criteria | Business rule | Screen | MoSCoW |
|---|---|---|---|---|---|---|---|---|---|
| BN-LST-01 | MOD-04 | FEAT-18 | FR-036 | EP-04 | US-027 | AC-LST-01.1, AC-LST-01.2 | BR-09 | S-11, S-03…S-05, S-07 | Must |
| BN-LST-02 | MOD-04 | FEAT-18 | FR-037 | EP-04 | US-027 | AC-LST-02.1 | BR-04, BR-09 | S-11 | Must |
| BN-LST-03 | MOD-04 | FEAT-18 | FR-038 | EP-04 | US-027 | AC-LST-03.1, AC-LST-03.2 | BR-07 | S-11 | Must |
| BN-LST-04 | MOD-04 | FEAT-18 | FR-039 | EP-04 | US-027 | AC-LST-04.1 | BR-04, BR-09 | S-11 | Must |
| BN-LST-05 | MOD-04 | FEAT-18 | FR-040 | EP-04 | US-027 | AC-LST-05.1 | — | S-11 | Must |
| BN-LST-06 | MOD-01, MOD-04 | FEAT-03, FEAT-18 | FR-005, FR-041 | EP-01 | US-004 | AC-LST-06.1 | BR-09 | S-11 | Should |
| BN-LST-07 | MOD-04 | FEAT-18 | FR-042 | EP-04 | US-027 | AC-LST-07.1 | BR-07, BR-08 | S-11 | Must |
| BN-LST-08 | MOD-04 | FEAT-18 | FR-043 | EP-04 | US-036 | AC-LST-08.1 | — | S-11, S-13 | Must |
| BN-LST-09 | MOD-04 | FEAT-19 | FR-044 | EP-04 | US-028 | AC-LST-09.1 | BR-04, BR-09 | S-11 | Should |
| BN-LST-10 | MOD-04, MOD-05 | FEAT-18, FEAT-23 | FR-045 | EP-04 | US-035 | AC-LST-10.1 | BR-09 | S-11, S-06 | Must |
| BN-DSH-01 | MOD-02 | FEAT-04 | FR-007 | EP-02 | US-005 | AC-DSH-01.1 | BR-04, BR-09 | S-01 | Must |
| BN-DSH-02 | MOD-02 | FEAT-04 | FR-008 | EP-02 | US-006 | AC-DSH-02.1 | BR-01 | S-01 | Must |
| BN-DSH-03 | MOD-02 | FEAT-05 | FR-009 | EP-02 | US-007 | AC-DSH-03.1 | BR-04, BR-09 | S-01 | Must |
| BN-DSH-04 | MOD-02 | FEAT-06 | FR-010, FR-015 | EP-02 | US-008, US-009, US-013 | AC-DSH-04.1, AC-DSH-04.2, AC-DSH-04.3 | BR-09 | S-01 | Must |
| BN-DSH-05 | MOD-02 | FEAT-07 | FR-011 | EP-02 | US-010 | AC-DSH-05.1 | BR-07 | S-01 | Should |
| BN-DSH-06 | MOD-02 | FEAT-07 | FR-012 | EP-02 | US-010 | AC-DSH-06.1 | BR-09 | S-01 | Should |
| BN-DSH-07 | MOD-02 | FEAT-07 | FR-013 | EP-02 | US-011 | AC-DSH-07.1 | BR-04 · **Q7** | S-01 | Could |
| BN-DSH-08 | MOD-02 | FEAT-08 | FR-014, FR-016 | EP-02 | US-012 | AC-DSH-08.1 | BR-07 | S-01 | Must |
| BN-REQ-01 | MOD-03 | FEAT-09, FEAT-10 | FR-017, FR-018, FR-019, FR-020, FR-021 | EP-03 | US-014, US-015, US-026 | AC-REQ-01.1…AC-REQ-01.4 | BR-02, BR-07 | S-02.1 | Must |
| BN-REQ-02 | MOD-03 | FEAT-11 | FR-022, FR-034 | EP-03 | US-016 | AC-REQ-02.1 | BR-01, BR-04 | S-02.5 | Should |
| BN-REQ-03 | MOD-03 | FEAT-12 | FR-023 | EP-03 | US-017 | AC-REQ-03.1 | **BR-02** | S-02.2 | Must |
| BN-REQ-04 | MOD-03 | FEAT-12 | FR-024 | EP-03 | US-017 | AC-REQ-04.1 | BR-02, BR-03 | S-02.2 | Must |
| BN-REQ-05 | MOD-03 | FEAT-13 | FR-025, FR-026, FR-035 | EP-03 | US-018, US-019 | AC-REQ-05.1, AC-REQ-05.2, AC-REQ-05.3 | **BR-08**, BR-05 | S-02.3 | Must |
| BN-REQ-06 | MOD-03 | FEAT-13 | FR-027 | EP-03 | US-020 | AC-REQ-06.1 | BR-04, BR-08 | S-02.3 | Should |
| BN-REQ-07 | MOD-03 | FEAT-17 | FR-028 | EP-03 | US-025 | AC-REQ-07.1 | BR-02, BR-08 | S-02.1 | Could |
| BN-REQ-08 | MOD-03, MOD-06 | FEAT-14, FEAT-32 | FR-029, FR-076 | EP-03, EP-06 | US-021, US-049 | AC-REQ-08.1, AC-REQ-08.2 | BR-01, BR-07 | S-02.3, S-03 | Should *(rec. R1)* |
| BN-REQ-09 | MOD-03 | FEAT-10, FEAT-15 | FR-030, FR-031 | EP-03 | US-022 | AC-REQ-09.1 | BR-02, BR-01 | S-02.6 | Must |
| BN-REQ-10 | MOD-03 | FEAT-09 | FR-032 | EP-03 | US-023 | AC-REQ-10.1 | — | S-02.1 | Must |
| BN-ACT-01 | MOD-04 | FEAT-20 | FR-047 | EP-04 | US-029 | AC-ACT-01.1 | **BR-01** | S-03 | Must |
| BN-ACT-02 | MOD-04 | FEAT-20 | FR-048 | EP-04 | US-029 | AC-ACT-02.1 | BR-04 | S-03 | Must |
| BN-ACT-03 | MOD-04 | FEAT-20 | FR-049 | EP-04 | US-029 | AC-ACT-03.1 | BR-01 | S-03 | Must |
| BN-ACT-04 | MOD-06, MOD-03 | FEAT-28, FEAT-16 | FR-069, FR-033, FR-074 | EP-06, EP-03 | US-065, US-024, US-047 | AC-ACT-04.1, AC-ACT-04.2, AC-ACT-04.3 | BR-01, BR-09 | S-03, S-06 | Must |
| BN-ACT-05 | MOD-06 | FEAT-30 | FR-072, FR-073 | EP-06 | US-045, US-046 | AC-ACT-05.1, AC-ACT-05.2 | BR-01, BR-04 | S-09, S-04 | Must |
| BN-ACT-06 | MOD-06 | FEAT-29 | FR-070, FR-080 | EP-06 | US-043 | AC-ACT-06.1 | **BR-03** | S-09, S-06 | Must |
| BN-ACT-07 | MOD-06 | FEAT-29, FEAT-35 | FR-071, FR-079 | EP-06 | US-044, US-052 | AC-ACT-07.1, AC-ACT-07.2 | **BR-03**, BR-01 | S-09, S-03 | Must |
| BN-ACT-08 | MOD-04 | FEAT-20 | FR-050 | EP-04 | US-030 | AC-ACT-08.1 | BR-07 | S-03 | Should |
| BN-ACT-09 | MOD-06 | FEAT-34 | FR-078 | EP-06 | US-051 | AC-ACT-09.1 | BR-03 | S-03, S-09 | Could |
| BN-DTL-01 | MOD-05 | FEAT-23 | FR-061 | EP-05 | US-037, US-064 | AC-DTL-01.1, AC-DTL-01.2 | **BR-04** | S-06 | Must |
| BN-DTL-02 | MOD-05 | FEAT-23 | FR-062 | EP-05 | US-038 | AC-DTL-02.1 | BR-04 | S-06 | Must |
| BN-DTL-03 | MOD-05 | FEAT-23 | FR-063 | EP-05 | US-037 | AC-DTL-03.1 | BR-04 | S-06 | Must |
| BN-DTL-04 | MOD-05 | FEAT-24 | FR-064 | EP-05 | US-039 | AC-DTL-04.1 | BR-04 | S-06 | Must |
| BN-DTL-05 | MOD-05, MOD-10 | FEAT-25, FEAT-48 | FR-065, FR-105 | EP-05, EP-10 | US-040, US-066 | AC-DTL-05.1, AC-AUDIT.1 | BR-04 | S-06 | Must |
| BN-DTL-06 | MOD-05, MOD-06 | FEAT-23, FEAT-28 | FR-066, FR-069 | EP-05 | US-037 | AC-DTL-06.1 | BR-01 | S-06 | Must |
| BN-CLS-01 | MOD-04 | FEAT-21 | FR-051 | EP-04 | US-031 | AC-CLS-01.1 | **BR-01** | S-04 | Must |
| BN-CLS-02 | MOD-04 | FEAT-21 | FR-052 | EP-04 | US-031 | AC-CLS-02.1 | BR-07 | S-04 | Must |
| BN-CLS-03 | MOD-04 | FEAT-21 | FR-053 | EP-04 | US-031 | AC-CLS-03.1 | BR-04 | S-04, S-06 | Must |
| BN-CLS-04 | MOD-07 | FEAT-36 | FR-081 | EP-07 | US-053 | AC-CLS-04.1, AC-INV-04.1 | **BR-06** | S-04, S-08 | Must |
| BN-CLS-05 | MOD-04 | FEAT-21 | FR-054 | EP-04 | US-031 | AC-CLS-05.1 | BR-06 | S-04 | Must |
| BN-CLS-06 | MOD-06 | FEAT-33 | FR-077 | EP-06 | US-050 | AC-CLS-06.1 | BR-01, BR-06 · **Q3** | S-04, S-06 | Must |
| BN-CLS-07 | MOD-04 | FEAT-21 | FR-055 | EP-04 | US-032 | AC-CLS-07.1 | BR-06 | S-04 | Should |
| BN-ALL-01 | MOD-04 | FEAT-22 | FR-056 | EP-04 | US-033 | AC-ALL-01.1 | BR-01, BR-09 | S-05 | Must |
| BN-ALL-02 | MOD-04 | FEAT-22 | FR-057 | EP-04 | US-033 | AC-ALL-02.1 | BR-01 | S-05 | Must |
| BN-ALL-03 | MOD-04, MOD-06 | FEAT-22, FEAT-35 | FR-058, FR-079 | EP-04, EP-06 | US-033, US-052 | AC-ALL-03.1 | **BR-01** | S-05 | Must |
| BN-ALL-04 | MOD-06 | FEAT-28 | FR-066, FR-069 | EP-06 | US-033 | AC-ALL-04.1 | BR-01 | S-05 | Must |
| BN-ALL-05 | MOD-04 | FEAT-22 | FR-059 | EP-04 | US-034 | AC-ALL-05.1 | — | S-05 | Could |
| BN-ALL-06 | MOD-04 | FEAT-19 | FR-060 | EP-04 | US-028, US-033 | AC-ALL-06.1 | BR-04, NFR-04 | S-05 | Should |
| BN-INV-01 | MOD-07 | FEAT-40 | FR-090 | EP-07 | US-059 | AC-INV-01.1 | BR-04 | S-07 | Must |
| BN-INV-02 | MOD-07 | FEAT-40 | FR-091 | EP-07 | US-059 | AC-INV-02.1 | BR-04, BR-07 | S-07 | Must |
| BN-INV-03 | MOD-07 | FEAT-36, FEAT-39 | FR-082, FR-089 | EP-07 | US-053, US-058 | AC-INV-03.1, AC-INV-03.2 | **BR-06** | S-08 | Must |
| BN-INV-04 | MOD-07 | FEAT-36 | FR-083 | EP-07 | US-053 | AC-INV-04.1 | BR-08 | S-08 | Must |
| BN-INV-05 | MOD-07 | FEAT-37 | FR-084, FR-085 | EP-07 | US-054 | AC-INV-05.1 | BR-08 | S-08 | Must |
| BN-INV-06 | MOD-07 | FEAT-38 | FR-086, FR-087, FR-088 | EP-07 | US-055, US-056, US-057 | AC-INV-06.1, AC-INV-06.2 | BR-04, NFR-04 | S-08, S-09 | Must |
| BN-INV-07 | MOD-07 | FEAT-41 | FR-092 | EP-07 | US-056 | AC-INV-07.1 | NFR-04 | S-07, S-08 | Must |
| BN-INV-08 | MOD-01, MOD-02 | FEAT-02, FEAT-04 | FR-004, FR-007 | EP-01, EP-02 | US-003, US-009 | AC-NAV-03.1, AC-INV-08.1 | BR-04, BR-09 | S-00, S-01 | Must |
| BN-INV-09 | MOD-07 | FEAT-42 | FR-093 | EP-07 | US-060 | AC-INV-09.1 | BR-04, NFR-06 | S-08 | Should |
| BN-INV-10 | MOD-07 | FEAT-40 | FR-094 | EP-07 | US-059 | AC-INV-10.1 | BR-08 | S-07 | Should |

### 16.2 Rules, notifications, non-functional requirements and objectives

| BRD element | Module | Feature | FR | Story | Acceptance / measure | Screen |
|---|---|---|---|---|---|---|
| BR-01 | MOD-06, MOD-04 | FEAT-35, FEAT-22 | FR-079, FR-058, FR-047, FR-051, FR-056 | US-052, US-033 | AC-ALL-03.1; property test (§11) | S-03…S-05 |
| BR-02 | MOD-03 | FEAT-12 | FR-023, FR-030 | US-017, US-022 | AC-REQ-03.1; ES-09 | S-02.2 |
| BR-03 | MOD-06 | FEAT-29 | FR-070, FR-071 | US-043, US-044 | AC-ACT-07.1, AC-ACT-07.2; 20-way concurrency test | S-09 |
| BR-04 | MOD-09 | FEAT-47 | FR-103 | US-064 | AC-DTL-01.2, AC-INV-cust | S-12 |
| BR-05 | MOD-05 | FEAT-27 | FR-068 | US-042 | AC-BR05.1 | S-06, S-09 |
| BR-06 | MOD-07 | FEAT-36 | FR-081, FR-082 | US-053 | AC-INV-03.1 | S-04, S-08 |
| BR-07 | MOD-04 | FEAT-18 | FR-038, FR-042 | US-027 | AC-LST-03.1, AC-LST-07.1; cross-time-zone tests | S-11 |
| BR-08 | MOD-03, MOD-07 | FEAT-13, FEAT-37 | FR-025, FR-035, FR-085 | US-018, US-054 | AC-REQ-05.1, AC-INV-05.1; rounding edge cases | S-02.3, S-08 |
| BR-09 | MOD-09 | FEAT-46 | FR-102, FR-104 | US-063 | AC-SCOPE.1 | S-12 |
| BRD §11 (N-01…N-08) | MOD-08 | FEAT-43, FEAT-44 | FR-096…FR-099 | US-061, US-062 | AC-NOTIF.1, AC-NOTIF.2 | S-10 |
| NFR-01 | — | FEAT-18, FEAT-04 | NFR-001…NFR-004 | — | Load test (§7) | S-03…S-07, S-01 |
| NFR-02 | MOD-10 | FEAT-49 | NFR-005, NFR-006 | US-067 | Synthetic checks; AC-PLAT-01.1 | — |
| NFR-03 | MOD-09 | FEAT-45, FEAT-46 | NFR-008…NFR-011, FR-100, FR-101 | US-065 | Authorization matrix tests; AC-SESS-01.1 | S-12 |
| NFR-04 | MOD-10 | FEAT-48 | NFR-017, FR-105 | US-066 | AC-AUDIT.1 | S-06 |
| NFR-05 | MOD-09 | FEAT-47 | NFR-020, FR-103 | US-064 | AC-DTL-01.2; DPIA on WA-08 | S-12 |
| NFR-06 | MOD-08, MOD-07 | FEAT-43, FEAT-42 | NFR-015, FR-097, FR-093 | US-060, US-061 | Locale snapshot tests; AC-INV-09.1 | all |
| NFR-07 | all | FEAT-18, FEAT-23 | NFR-013 | all | AC-A11Y.1 | all |
| NFR-08 | all | — | NFR-014 | all | Cross-browser and responsive suite | all |
| OBJ-1 | MOD-03, MOD-06 | FEAT-09, FEAT-29 | FR-030, FR-070 | US-014, US-043 | M-1 (TM-02, TM-03) | S-02, S-03 |
| OBJ-2 | MOD-03, MOD-06, MOD-08 | FEAT-14, FEAT-32, FEAT-43 | FR-029, FR-076, FR-096 | US-021, US-049 | M-2 (TM-02, TM-04, TM-05) | S-02.3, S-01 |
| OBJ-3 | MOD-07 | FEAT-36, FEAT-38 | FR-081, FR-086, FR-087 | US-053, US-056 | M-3 (TM-08, TM-10) | S-04, S-07, S-08 |
| OBJ-4 | MOD-01…MOD-07 | FEAT-01 | FR-001 | US-001 | M-4 (`surface` property) | S-00 |
| OBJ-5 | MOD-04, MOD-06 | FEAT-22, FEAT-35 | FR-058, FR-079 | US-033, US-052 | M-5 (support tags) | S-05 |
| BRD §13 integrations | MOD-10 | FEAT-51 | FR-108 | US-067 | ES-27 | S-13 |
| BRD §14 risks and assumptions | MOD-10, MOD-05 | FEAT-50, FEAT-26, FEAT-53 | FR-107, FR-067, FR-110 | US-041, US-069 | AC-CONS-01.1, AC-PLAT-03.1 | S-06 |
| Q1…Q7 | — | — | — | — | Appendix J.1 (interim behaviour) | — |

### 16.3 Coverage counts

| Element | Total | Covered | Evidence |
|---|---|---|---|
| BRD functional requirements (BN-LST 10 · DSH 8 · REQ 10 · ACT 9 · DTL 6 · CLS 7 · ALL 6 · INV 10) | 66 | 66 | §16.1 — every row has a module, feature, FR, epic, story, acceptance criterion, screen and priority |
| …by priority | 50 Must · 12 Should · 4 Could | same | §15 |
| Business rules BR-01…BR-09 | 9 | 9 | §11, each with constraint, behaviour and acceptance criteria |
| Non-functional requirements NFR-01…NFR-08 | 8 | 8 → 20 product NFRs | §7 |
| Notifications (BRD §11) | 8 | 8 | Appendix E, AC-NOTIF.1 |
| Objectives OBJ-1…OBJ-5 | 5 | 5 | Appendix F, M-1…M-5 |
| Open business questions Q1…Q7 | 7 | 7 | Appendix J.1 with interim behaviour |
| Product modules | 10 | 10 | §4 |
| Features | 53 | 53 | §8, each with ≥ 1 FR and ≥ 1 story |
| Functional requirements | 110 | 110 | §6, each citing a BRD source |
| Epics · stories | 10 · 69 | 10 · 69 | §9, every story with ≥ 1 acceptance criterion |
| Acceptance criteria | 99 | — | §10 |
| Edge cases | 32 | 32 | §12, each with behaviour, message, data impact and a criterion |
| Screens | 14 (+6 request sub-screens) | 14 | §14, each with six states |

### 16.4 Orphan check

- **BRD → PRD:** every BN-*, BR-*, NFR-*, OBJ-* and BRD §11 notification appears in §16.1 or §16.2. None is unmapped.
- **PRD → BRD:** every FR header cites the BRD requirement, rule, risk or integration it comes from. The FRs without a single `BN-*` parent are FR-006, FR-015, FR-016, FR-033, FR-035, FR-046, FR-066, FR-067, FR-068, FR-074, FR-075, FR-079, FR-095, FR-096…FR-110 — each derived from BRD §5, §7, §8, §11, §13, §14 or a BR/NFR, as its header states. Nothing introduces a capability outside BRD §4 *In scope*.
- **Features without a story:** none. **Stories without acceptance criteria:** none. **Rules without a feature constraint:** none (§11). **Edge cases without defined behaviour:** none (§12). **Screens absent from a workflow:** none — every screen in §14 appears in a journey (§13.1) or is a cross-screen specification (S-11, S-12, S-13).

---

## 17. PRD validation summary

A consistency review was run over this document against BN-BRD-001 v1.0, the SPEC and its companions, the Architecture Spine and the UX package. What was checked, and what it found:

### 17.1 Coverage

| Check | Result |
|---|---|
| BRD functional requirements with a module, feature, FR, epic, story, acceptance criterion, screen and priority | **66 / 66** |
| Business rules BR-01…BR-09 with a constraint, expected behaviour and acceptance criteria | **9 / 9** |
| BRD NFR-01…NFR-08 expressed as product NFRs with a test method | **8 / 8** (expanded to NFR-001…NFR-020, covering all 14 requested NFR areas) |
| Notifications in BRD §11 specified with recipients, channels and text | **8 / 8** |
| Objectives OBJ-1…OBJ-5 with a formula, instrumentation and baseline | **5 / 5** |
| Features with at least one user story | **53 / 53** |
| User stories with at least one acceptance criterion | **69 / 69** |
| Edge cases with expected behaviour, message, data impact and a criterion | **32 / 32** |
| Screens with default, loading, empty, error, success and permission-restricted states | **14 / 14** |
| Personas with responsibilities, goals, needs, pain points, permissions and interactions | **5 / 5** |
| Stakeholders with role, interest, expectations and interaction | **15 / 15** |

### 17.2 Findings

**F-1 — Unresolved assumptions (unchanged from v1.0, carried forward).** Six questions must be answered before or during R1 build, because the product behaves differently depending on the answer. Each is built today as a working assumption, isolated behind configuration where practical.

| ID | Question | Working assumption | Owner | Blocking |
|---|---|---|---|---|
| PQ-01 | How does a partner whose request was withdrawn or expired see the trip, given one status per trip? | WA-01 mapping (FR-079) | Product | **R1** |
| PQ-02 | Are the BRD's "main tabs" a hard visibility rule? | WA-02: no — emphasis only | Product | **R1** |
| PQ-04 | Who may create, edit and submit invoices? | WA-04: Finance and Admin of the partner company | Finance | **R1** |
| PQ-10 | If no deadline is set, when does an unanswered request close? | WA-10: deadline defaults to planned start | Sales (with Q6) | **R1** |
| PQ-15 | Exactly which customer data may a partner see "to run the trip"? | WA-08: contact name and phone, sign, group ref., flight no. | Product + DPO | **R1** |
| PQ-13 | Host currency versus "company currency" for invoices | WA-17: all amounts in the host's currency | Finance | **R1 (finance)** |

**F-2 — Sequencing recommendation (unchanged).** BN-REQ-08 is *Should*, but OBJ-2, notification N-05 and the only exit from an unanswered Requested trip depend on it. Recommendation: pull FEAT-14 and FEAT-32 into R1 (§15.6). The BRD priority is unchanged.

**F-3 — New questions raised by this version.** Two gaps surfaced while writing the edge-case and session behaviour that the BRD does not cover. Both are recorded as working assumptions with questions, not as new requirements:

| ID | Question | Working assumption | Owner | Blocking |
|---|---|---|---|---|
| PQ-22 | What happens when a TEQ trip that is already shared is shared again? | WA-30: blocked, with a link to the existing network trip (ES-32) | Sales | R1 |
| PQ-23 | What should happen to unsent form input when a session expires? | WA-31: return to the same URL after sign-in, input preserved in the browser, drafts recommended for long forms (ES-25) | Product | R1.1 |

**F-4 — Dependencies the workspace cannot supply.** Unchanged and named rather than invented: the Bus Network service data model and API (D-1), TEQ Scheduler minute-level jobs with monitoring (D-2), push and SMS channels (D-3), support-system tags in place ≥ 3 months before launch for the M-5 baseline (D-4), and the legacy attribute names needed to finish the migration mapping (Appendix G).

**F-5 — Checks that found nothing to report.**

| Checked for | Result |
|---|---|
| Missing requirements (BRD element with no PRD home) | None — §16.4 |
| Unmapped business requirements | None — 66 / 66 in §16.1 |
| Features without user stories | None |
| Stories without acceptance criteria | None |
| Business rules without feature constraints | None — §11 |
| Edge cases without defined behaviour | None — §12 |
| Screens missing from workflows | None — every screen appears in §13.1 or is a cross-screen specification |
| Duplicate requirements | None. Near-duplicates were merged deliberately and cross-referenced instead: FR-005 (routes) vs FR-041 (list URL state); FR-004 (nav badge) vs FR-007 (dashboard *Open invoices*) — both defined as the same count, stated once in each place; FR-066 and FR-069 are one action matrix cited from two modules |
| Contradictory requirements | None found. Two BRD tensions are carried as written with their resolution stated, not silently reconciled: the dashboard tile *Active trips* (Accepted + In progress) versus the Active Trips badge (all three open statuses) — both kept, each defined where it appears (FR-003, FR-007); and BR-08 "host company's currency" versus the BRD §9.6 column label "company currency" — carried as WA-17 with PQ-13 |
| Missing dependencies | None at requirement level; the four platform dependencies in F-4 are named |
| Missing stakeholder needs | None — §3 covers all 15 stakeholders, including those the BRD names only as question owners and sign-off roles |
| Incorrect or incomplete traceability | None — §16 is complete in both directions |

**F-6 — Downstream impact of this version.** The document was restructured from 20 sections to 16 plus appendices. Requirement, acceptance-criterion, edge-case, journey and screen IDs are all unchanged, so every ID-based citation in the SPEC, Architecture Spine, UX package and prototype still resolves. Citations that point at a **section number** of PRD v1.0 (for example "PRD §7.4 matrix", "PRD §5.2") are mapped in **Appendix K**; the SPEC, Architecture Spine and SCREENS should be updated to the new numbers at their next revision. No requirement, rule, priority or assumption changed in this version.

### 17.3 Remaining open questions

| Source | Open | Blocking R1 |
|---|---|---|
| BRD §15 | Q1 (Invoice List vs Claim Settlement) · Q2 (*Paid* status) · Q3 (reopen closed trips) · Q4 (first-accept-wins vs host chooses) · Q5 (automatic completion) · Q6 (default deadline) · Q7 (partner names in charts) | Q3 and Q4 change the state machine and should be answered before R1 is estimated; the rest are built behind configuration |
| PRD (Appendix J.2) | PQ-01, PQ-02, PQ-03, PQ-04, PQ-05, PQ-06, PQ-07, PQ-08, PQ-09, PQ-10, PQ-11, PQ-13, PQ-14, PQ-15, PQ-16, PQ-17, PQ-18, PQ-19, PQ-20, PQ-21, PQ-22, PQ-23 | PQ-01, PQ-02, PQ-04, PQ-10, PQ-15 (and PQ-13 for finance) |

**Verdict: the PRD is implementation-ready.** Every business requirement is traceable through module, feature, functional requirement, story, acceptance criterion, screen and priority. What remains open is six business decisions, not gaps in the specification; each is built today behind a stated assumption that can be replaced without restructuring this document.

---

## 18. Appendices

### Appendix A — Information architecture, routes and URL state

**Navigation bar.** Fixed order (BRD §7): **Dashboard · Request · Active Trips · Closed Trips · All Trips · Invoice List**. A tab the user cannot open is hidden, not disabled (FR-002).

| Tab | Visible to | Badge | Badge definition |
|---|---|---|---|
| Dashboard | All roles | — | — |
| Request | Sales, Admin (holders of *Create / share request*) | — | — |
| Active Trips | Sales, Partner Coord., Admin (+ Finance, Viewer — **WA-02**) | Yes | Trips in the user's scope with company-view status Requested, Accepted or In progress |
| Closed Trips | Partner Coord., Finance, Admin (+ Sales, Viewer — **WA-02**) | — | — |
| All Trips | Sales, Admin, Viewer (+ Partner Coord., Finance — **WA-02**) | — | — |
| Invoice List | Finance, Admin | Yes | Incoming invoices with status Pending in the user's scope (BN-INV-08) |

**Routes and parameters** (FR-005, FR-041):

| Screen | Route | URL parameters |
|---|---|---|
| Dashboard | `/busnetwork` | `period=week\|month\|30d\|custom&from=&to=` |
| Request (new) | `/busnetwork/request` | `source=<teqTripId>` (prefill), `draft=<draftId>` |
| Active Trips | `/busnetwork/trips/active` | `q, from, to, company, status (csv), direction=all\|shared\|received, sort=<field>:<asc\|desc>, page, size` |
| Closed Trips | `/busnetwork/trips/closed` | as above + `closedFrom, closedTo, invoice=not_invoiced` |
| All Trips | `/busnetwork/trips/all` | as above + `status` from all six, `group=active\|closed` |
| Trip detail | `/busnetwork/trips/<tripId>` | `from=<list URL>` (return target) |
| Invoice List | `/busnetwork/invoices/incoming\|outgoing\|archive` | `q, status, company, tripFrom, tripTo, invFrom, invTo, sort, page, size` |
| Invoice | `/busnetwork/invoices/<invoiceNo>` | `v=<version>` |

Dates in URLs are `YYYY-MM-DD` in the user's time zone; the server converts them to UTC ranges (BR-07). A parameter the user may not use is dropped with a "Some filters were removed" notice (ES-14).

**Dashboard deep links** (FR-008):

| Key figure | Opens |
|---|---|
| Awaiting response | `/trips/active?status=REQUESTED&direction=received` (**WA-03**) |
| Active trips | `/trips/active?status=ACCEPTED,IN_PROGRESS` |
| Starting next 7 days | `/trips/active?status=ACCEPTED,IN_PROGRESS&from=<today>&to=<today+6>` |
| Closed this month | `/trips/closed?status=COMPLETED&closedFrom=<1st>&closedTo=<today>` |
| Open invoices | `/invoices/incoming?status=PENDING` |

### Appendix B — Trip and invoice lifecycle model

#### B.1 Two records: trip and share request

The BRD's six statuses describe the **trip**. Because one request can go to several partners (BN-REQ-04) who answer separately (BN-ACT-05/07), the product also keeps one **share request** per partner (BRD §13, *Bus Network service*: "share requests").

| Share request state | Set when |
|---|---|
| `PENDING` | The request was submitted to this partner |
| `ACCEPTED` | This partner accepted first |
| `REJECTED` | This partner rejected, with a reason |
| `WITHDRAWN` | Another partner accepted (BN-ACT-07), the host cancelled while Requested, or the host removed this partner during *Edit* |
| `EXPIRED` | The response deadline passed while still pending (BN-REQ-08) |

**Company-view status** (FR-079, **WA-01 / PQ-01**): the host sees the trip status; a partner sees a status derived from its own share request — `PENDING` → Requested · `ACCEPTED` → the trip status · `REJECTED` → Rejected (own reason) · `EXPIRED` → Rejected ("Expired") · `WITHDRAWN` → Cancelled ("Another partner accepted" / the host's reason / "Removed by host").

#### B.2 Trip transitions (BRD §7, with guards and side effects)

| # | From | Event | To | Actor (role) | Guard | Side effects |
|---|---|---|---|---|---|---|
| T1 | — | Submit request | **Requested** | Host: Sales, Admin | Step validation passes (BN-REQ-01); ≥ 1 partner with accepted affiliation (BR-02); every offer price > 0 | Share requests `PENDING`; TEQ trip marked shared (BN-REQ-09); history entry; N-01 to each partner |
| T2 | Requested | Partner accepts | **Accepted** | Partner: Partner Coord., Admin | Trip still Requested **and** this share request still `PENDING` (DR-04); deadline not passed | This request `ACCEPTED`; all other `PENDING` → `WITHDRAWN` (BN-ACT-07); N-02 to the host creator; N-03 to withdrawn partners; history |
| T3a | Requested | Partner rejects | Requested (host) / Rejected (that partner) | Partner: Partner Coord., Admin | Share request `PENDING`; reason given (BN-ACT-05) | Request `REJECTED`; history. If no `PENDING` requests remain → T3b |
| T3b | Requested | Last pending partner rejects | **Rejected** | System | All requests `REJECTED` / `WITHDRAWN` / `EXPIRED` | Trip reason "Rejected by all partners"; N-02 (rejected) to the host creator |
| T3c | Requested | Response deadline passes | **Rejected** | System (Scheduler) | `now ≥ response_deadline` and no acceptance | Pending → `EXPIRED`; trip reason "Expired" (BN-REQ-08); N-02 to the host creator |
| T4 | Requested, Accepted | Cancel with reason | **Cancelled** | Host or partner: Sales, Partner Coord., Admin | Reason given (BN-ACT-05); a partner may cancel only if its request is `ACCEPTED` | Pending requests → `WITHDRAWN`; N-04 to the other company (SMS if start < 24 h); history |
| T5 | Accepted | Planned start reached | **In progress** | System (Scheduler) | `now ≥ planned_start_utc` | History |
| T6 | In progress | Planned end reached | **Completed** | System (Scheduler) | `now ≥ planned_end_utc` (**Q5**) | `closed_at` set; history |
| T7 | In progress | Mark complete | **Completed** | Partner: Partner Coord., Admin (**WA-05**) | Trip In progress | `closed_at` set; history |

**Not allowed**, refused with a specific message (§12): any transition out of Completed, Cancelled or Rejected (BN-CLS-06, **Q3**); Cancel from In progress (**PQ-08**); Accept or Reject when the request is no longer pending. **Every** transition writes a history entry with actor (or "System"), company, time and before/after values (BN-DTL-05, NFR-04).

#### B.3 Invoice transitions (BRD §9.6)

| # | From | Event | To | Actor | Guard | Effects |
|---|---|---|---|---|---|---|
| I1 | — | Create invoice | **Draft** | Partner Finance / Admin (**WA-04**) | Trip Completed (BR-06, BN-INV-03); no non-Declined invoice for the trip | Prefill (FR-083); invoice number assigned; history |
| I2 | Draft | Edit | Draft | Partner Finance / Admin | — | Amounts editable |
| I3 | Draft | Submit | **Pending** | Partner Finance / Admin | ≥ 1 line; all lines valid | `submitted_at`; N-07 to host Finance; host badge +1 |
| I4 | Pending | Approve | **Approved** | Host Finance / Admin | — | Amounts locked (snapshot); `decided_at` / `decided_by`; N-08 |
| I5 | Pending | Decline (reason) | **Declined** | Host Finance / Admin | Reason required | `decided_at` / `decided_by`, reason; snapshot; N-08 |
| I6 | Declined | Edit & resubmit | new version **Draft** → **Pending** | Partner Finance / Admin | — | New version of the same invoice number (`v2`, `v3`…); the declined version stays read-only (**WA-11**) |

A Draft may be deleted by its own company; nothing else is ever deleted (**WA-23**, NFR-04).

#### B.4 Scheduler rules

| Job | Runs | Does | Timeliness (DR-07) |
|---|---|---|---|
| Start trips | every minute | T5 for trips whose planned start has passed | ≤ 5 min after planned start |
| Complete trips | every minute | T6 (behind a setting, pending **Q5**) | ≤ 5 min after planned end |
| Expire requests | every minute | T3c | ≤ 5 min after the deadline |
| Expiry warning | every minute | N-05 once, when `deadline − 2 h ≤ now` | ≤ 5 min after the 2-hour mark |
| Nightly consistency check | daily 02:00 CET | Compare each network trip with its linked TEQ trip; raise flags | Flags visible next morning |

Jobs are idempotent: a re-run never repeats a transition or a notification (**DR-08**). For fixed trips, planned start is the first sub-trip's start and planned end the last sub-trip's end (**WA-09**).

### Appendix C — Data requirements

Business-level entities; the Architecture Spine owns the physical model. Times are UTC (BR-07); money is integer minor units with a currency (BR-08); personal data is minimised (NFR-05).

| ID | Entity | Must carry | Invalid if |
|---|---|---|---|
| DE-01 | **Network trip** | Trip ID (= TEQ trip ID); link to the source TEQ trip; host company; type (NORMAL / FIXED); **status** (one of six) + `status_changed_at`; `closed_at`; closed reason (code + text); planned start / end / return (UTC); route (from, ≤ 8 ordered vias, to — each with coordinates); alternative start address; PAX; vehicle requirements; flight no., group ref., sign; comment fields (partner, driver, HQ, invoice comment, invoice reference); customer + contact (host-only); customer price + currency (host-only); response deadline; accepted partner; department; created by / at | Two statuses; end ≤ start; > 8 vias; a closed status without `closed_at` |
| DE-02 | **Shift / sub-trip** (fixed trips) | Shift name; sub-trips with from / to and start / end (UTC) | A fixed trip with no shift |
| DE-03 | **Share request** | Trip; partner company; agreement type + rate at submission; calculated offer price; offer price; override flag + by / at; additional costs; state (B.1); responded by / at; reason | Offer price ≤ 0 at submission; a partner without an accepted affiliation at submission |
| DE-04 | **Comment** | Trip; author; company; body; created at; per-user read state | Edited after posting |
| DE-05 | **History / audit entry** | Entity + ID; action; actor (user or System); company; at (UTC); before; after | Missing actor or time; modified; deleted before 5 years |
| DE-06 | **Attachment** | Trip; file name; type; size; storage key; scan result; uploaded by / at | > 10 MB; type outside PDF/JPG/PNG/DOCX; > 2 per trip |
| DE-07 | **Request draft** | Creator; company; step reached; partial form data; last edited | Visible to another company |
| DE-08 | **Invoice** | Invoice no.; version; trip; issuer (partner) and recipient (host); status; lines; totals excl. VAT / VAT / total; currency; submitted at; decided at / by; decline reason; locked snapshot; PDF key | For a non-Completed trip; a second non-Declined invoice for a trip; Approved without a snapshot |
| DE-09 | **Invoice line** | Description; quantity; unit price; VAT rate; source (offer price / additional cost / extra) | Empty description; quantity ≤ 0 |
| DE-10 | **Notification** | Event (N-01…N-08); recipient; channel; locale; sent / failed; attempts | — |
| DE-11 | **Reason catalogue** | Company; kind (reject / cancel / decline); code; label per locale; active | — |
| DE-12 | **User list preferences** | User; list; page size; hidden columns (BN-ALL-05) | — |
| DE-13 | **Consistency flag** | Trip; field; network value; TEQ value; checked at; resolved at | — |

### Appendix D — Integrations

From BRD §13, with what the product needs and what happens when each fails (FR-108, ES-27).

| System | Product needs | If unavailable |
|---|---|---|
| **Bus Network service** | Store and read trips, share requests, statuses and invoices; filter and count by the six statuses | Error with Retry; no action half-applied (DR-05) |
| **TEQ Sales / Planning** | Prefill from TEQ trips; customers (search and create); vehicle types and capacities; mark the TEQ trip shared; create a quotation for the partner | Prefill and customer search show "TEQ Sales is unavailable — try again"; submit blocked if the back-link cannot be written (BN-REQ-09, ES-28) |
| **TEQ Company Settings** | Bus Network account link; currency; VAT settings; language; company details for the PDF | Invoice creation blocked with a specific message; lists still load |
| **BusNetwork Settings** | Accepted affiliations; agreement type and rate; default partner (BN-REQ-07); reason lists and channel defaults (**WA-07**) | Partner step shows "Partner list unavailable"; submit blocked |
| **Google Maps** | Autocomplete, coordinates, route display, trip length | Address fields cannot validate → Next blocked with an explanation; detail shows addresses without a map |
| **TEQ Scheduler** | T3c, T5, T6, N-05, the nightly check (Appendix B.4) | Monitoring alerts when a job is > 5 min late; transitions catch up on recovery (idempotent) |
| **File storage (S3)** | Trip attachments and invoice PDFs | Upload and download show an error; trip and invoice data unaffected |
| **TEQ login and permissions** | Sign-in, roles, departments (NFR-03, BR-09) | Standard TEQ sign-in behaviour; session expiry per ES-25 |
| **Notification channels** (email, push, SMS) | BRD §11 delivery | Retries; failures logged; the action is unaffected (DR-09) |

### Appendix E — Notification catalogue

In-app and email always; push and SMS where the company has enabled them; message language is the recipient company's language (NFR-015). Every message deep-links to the trip or invoice.

| ID | Event | Recipients | Channels | Example text (en_US) |
|---|---|---|---|---|
| N-01 | New request received | Partner coordinators of each partner (department-scoped — **WA-27**) | In-app, email, push | "Nordic Coaches shared trip 48213 (2026-09-20 08:00, Oslo → Bergen). Respond by 2026-09-18 12:00." |
| N-02 | Request accepted / rejected (including expired) | The host sales user who created the request | In-app, email | "Fjord Buss accepted trip 48213." / "Trip 48213 was rejected: expired with no response." |
| N-03 | Offer withdrawn (another partner accepted) | The other partners' coordinators | In-app | "Trip 48213 is no longer available — another partner accepted it." |
| N-04 | Trip cancelled | The other company's users on the trip | In-app, email; SMS if start < 24 h | "Trip 48213 (2026-09-20 08:00) was cancelled by Nordic Coaches: Customer cancelled." |
| N-05 | Request expiring in 2 h | The host sales user who created the request | In-app, email | "Trip 48213 has no partner response and expires at 12:00." |
| N-06 | New comment | The other company's users on the trip | In-app | "Lars Berg (Fjord Buss) commented on trip 48213." |
| N-07 | Invoice submitted | Host finance users | In-app, email | "Fjord Buss submitted invoice BN-INV-2026-000184 (12 450,00 NOK) for trip 48213." |
| N-08 | Invoice approved / declined | Partner finance users | In-app, email | "Invoice BN-INV-2026-000184 was declined: Extra lines not agreed." |

*"Users on the trip"* = the host user who created the request, plus users who acted on or commented on it, plus the counterpart role named above, limited to users whose departments include the trip (**WA-27**, PQ-17). Delivery rules are FR-099 / **DR-09**: notifications never block or roll back the action that caused them, failures are retried and logged, re-runs never duplicate, and every channel except in-app can be switched off per event (FR-098).

### Appendix F — Success measurement and analytics

#### F.1 Metrics for the BRD objectives

| ID | Objective | Formula | Data | Baseline |
|---|---|---|---|---|
| M-1 | OBJ-1 | Median over accepted trips of `accepted_at − submitted_at`, monthly, compared to baseline | TM-02, TM-03 | Last 3 months of legacy data before launch (from the trial migration) |
| M-2 | OBJ-2 | Requests closed as Rejected / "Expired" **with zero partner responses** ÷ all requests that reached a closed status or Accepted, monthly | TM-02, TM-04, TM-05 | Legacy data if deadlines existed; otherwise the first full month |
| M-3 | OBJ-3 | Median over approved invoices of `invoice.approved_at − trip.closed_at` in days, monthly | TM-08, TM-10 | Legacy claims: closed → claim approved |
| M-4 | OBJ-4 | Network actions (share, accept, reject, cancel, comment, invoice create / submit / approve / decline) done in the portal ÷ the same actions done anywhere (portal + legacy screens), monthly | TM-* with `surface=portal\|legacy` | First month of coexistence |
| M-5 | OBJ-5 | Support tickets tagged *network-trip-status* or *network-missing-trip*, monthly; −50% against the 3-month pre-launch average | Support system tags (dependency D-4) | Pre-launch 3-month average |

#### F.2 Instrumentation events

| ID | Event | Key properties |
|---|---|---|
| TM-01 | `request_draft_saved` | step, trip_type |
| TM-02 | `request_submitted` | trip_id, partner_count, overrides_count, has_deadline, entry_point (tab / share / draft / quick) |
| TM-03 | `share_request_accepted` | trip_id, partner, minutes_since_submit, surface |
| TM-04 | `share_request_rejected` | trip_id, partner, reason_code, surface |
| TM-05 | `share_request_expired` | trip_id, responses_count |
| TM-06 | `trip_cancelled` | trip_id, side, from_status, reason_code, hours_to_start |
| TM-07 | `trip_completed` | trip_id, trigger (system / manual) |
| TM-08 | `invoice_created` / `invoice_submitted` | invoice_no, version, trip_id, lines, total |
| TM-09 | `invoice_declined` | invoice_no, version, reason_code |
| TM-10 | `invoice_approved` | invoice_no, days_since_trip_closed |
| TM-11 | `dashboard_figure_opened` | figure |
| TM-12 | `list_exported` | list, format, rows |
| TM-13 | `consistency_flag_raised` / `_resolved` | trip_id, field |

Events carry company and role but no personal data (NFR-020).

### Appendix G — Migration and rollout

#### G.1 Constraints from the BRD

- Existing "active" / "archive" trips and claims must map to the new statuses and invoices **without losing data** (BRD §14 assumption).
- The current *Sales › Network* screens keep working unchanged until the portal fully replaces them (BRD §14 constraint).
- Whether the Invoice List replaces Claim Settlement or runs alongside it is **Q1**.

#### G.2 Status mapping (**WA-29** — to be validated in the trial run)

| Legacy situation (meaning) | New trip status | Share request state |
|---|---|---|
| Active list, no partner response yet | Requested | `PENDING` |
| Active list, a partner accepted, before planned start | Accepted | `ACCEPTED` (others `WITHDRAWN`) |
| Accepted, now between planned start and end | In progress | `ACCEPTED` |
| Archive, accepted, planned end passed | Completed | `ACCEPTED` |
| Archive, cancelled by host or partner | Cancelled | as recorded |
| Archive, all partners rejected | Rejected | `REJECTED` |

Legacy attribute names come from the Bus Network service data model (dependency D-1). Trips whose legacy data fits no row go into a migration exception report — they are never guessed (FR-110).

#### G.3 Claim mapping

Claim statuses map one to one (BRD §9.6: "The statuses match today's Claim Settlement screens"): Draft → Draft, Pending → Pending, Approved → Approved, Declined → Declined. Existing claim references are kept as an alias; new numbers use `BN-INV-YYYY-NNNNNN` (**WA-24**).

#### G.4 Rollout steps

1. **Trial migration** on a copy of production; reconcile trip counts per status and claim totals per company; Finance sign-off (SUC-6, AC-PLAT-03.1).
2. **Pilot** with 3–5 companies on both sides of real partnerships; legacy screens remain.
3. **General availability** of R1; the portal is the default entry point; legacy screens still reachable.
4. **R1.1** *Should* items.
5. **Legacy retirement** when M-4 ≥ 90% for two consecutive months and **Q1** is decided (SUC-7).

### Appendix H — Assumptions, dependencies and risks

#### H.1 Assumptions and dependencies

| ID | Item | Source |
|---|---|---|
| A-1…A-4 | The four BRD §14 assumptions: linked Bus Network accounts; agreements current in BusNetwork Settings; the service can filter and count by the six statuses; legacy trips and claims can be mapped without loss | BRD §14 |
| D-1 | The Bus Network service data model and APIs are documented for the portal and migration teams | PRD |
| D-2 | TEQ Scheduler can run minute-level jobs with monitoring | BRD §13 |
| D-3 | TEQ push and SMS channels exist and can be enabled per company | BRD §11 |
| D-4 | Support-system tags exist ≥ 3 months before launch (M-5 baseline) | Appendix F |

#### H.2 Risks

BRD §14 risks apply unchanged (trip data divergence, simultaneous acceptance, cross-time-zone times, notification fatigue, claim migration). PRD-level additions:

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RP-1 | Working assumptions are built before confirmation and later reversed | Medium | Blocking PQs answered before R1 build starts; each assumption isolated behind configuration where practical (reason lists, deadline default, automatic completion) |
| RP-2 | Partner-side status mapping (WA-01) confuses users — "Cancelled" for a trip they never accepted | Medium | The reason text is always shown next to the status; usability test in the pilot |
| RP-3 | BN-REQ-08 ships late (it is *Should*), leaving Requested trips with no exit | High | Pull FEAT-14 and FEAT-32 into R1 (§15.6) |
| RP-4 | 50 000-row lists with free-text search miss NFR-001 | Medium | Search index on the five searchable fields; load test early (§7) |
| RP-5 | Section-number citations in downstream documents break after this restructure | Low | Appendix K maps every v1.0 section to its v2.0 home; IDs are unchanged |

### Appendix I — Derived requirements (DR)

Behaviour the BRD makes necessary but does not spell out. Each is cited by the functional requirements that implement it. Not new scope.

| ID | Derived requirement | Source | Used by |
|---|---|---|---|
| DR-01 | Lists query one source with a status predicate only; no other flag decides membership | BR-01, BN-ALL-03 | FR-047, FR-051, FR-056, FR-058 |
| DR-02 | The UI hides what is not allowed; the server refuses it regardless | NFR-03, BRD §5 | FR-002, FR-069, FR-101 |
| DR-03 | An out-of-scope object returns "not found", never a permission error | BR-09, BR-04 | FR-104 |
| DR-04 | Accept is an atomic conditional update on the trip and the share request | BRD §14 risk "Two partners accept at the same moment" | FR-070, FR-071 |
| DR-05 | No action is ever half-applied; a failed dependency leaves no partial write | BRD §13, §14 | FR-030, FR-108, NFR-007 |
| DR-06 | *(not issued — the ID is not reused)* | — | — |
| DR-07 | Scheduled transitions and warnings happen within 5 minutes of the due moment | BRD §13, BN-DSH-08 | FR-075, FR-076, FR-106, NFR-006 |
| DR-08 | Commands and scheduled jobs are idempotent; a double click has one effect | BRD §13, §11 | FR-030, FR-075, FR-086, FR-099 |
| DR-09 | Notifications are sent after commit, retried on failure, logged, and never duplicated | BRD §11, §14 | FR-096, FR-099 |
| DR-10 | The Invoice List search also matches the invoice number | BN-LST-02 applied to BN-INV-02 | FR-037, FR-091 |
| DR-11 | Sort ties are broken by Trip ID ascending so paging is stable | BN-LST-01, BN-LST-05 | FR-040 |
| DR-12 | Exports are recorded in the audit log | NFR-04 | FR-044, FR-105 |
| DR-13 | Comment read state is per user | BRD §8 (unread comments highlighted) | FR-046, FR-064, FR-010 |
| DR-14 | Free-text references are limited to 100 characters and comment fields to 2 000 | BN-REQ-01 (free text), NFR-01 | FR-019, FR-064 |
| DR-15 | Attachments are malware-scanned before they are shared | NFR-03 | FR-020, NFR-011 |
| DR-16 | Money is stored as integer minor units with an explicit currency | BR-08 | FR-025, FR-035, FR-085 |
| DR-17 | Line net = qty × unit price (rounded); line VAT = net × rate ÷ 100 (rounded); totals are sums of lines | BN-INV-04/05 with BR-08 | FR-085 |
| DR-18 | After session expiry the user returns to the URL they were on, with nothing partially committed | NFR-03 | FR-100, ES-25 |
| DR-19 | A reload rebuilds list and dashboard state from the URL; form state is not URL-backed and relies on drafts | BN-LST-06, BN-REQ-02 | FR-041, ES-26 |
| DR-20 | Boundaries are inclusive where the BRD states a maximum (8 vias, 2 attachments, PAX ≤ capacity, deadline ≤ planned start) and strict where it states an age or window (< 24 h flag, > 90 days archive) | BN-REQ-01, BN-ACT-08, BN-INV-01 | FR-019, FR-029, FR-050, FR-090, ES-29 |

### Appendix J — Working assumptions and open questions

#### J.1 BRD questions (BRD §15) and what the product builds until they are answered

| ID | Question | Owner | Interim behaviour |
|---|---|---|---|
| Q1 | Does the Invoice List replace Claim Settlement, or run alongside it? | Product / Finance | Coexistence (Appendix G.4); both read the same invoice data |
| Q2 | Should BusNetwork track *Paid* as a fifth invoice status? | Finance | Four statuses; no payment tracking |
| Q3 | Can a Completed or Cancelled trip be reopened? | Operations | No reopening (FR-077, BN-CLS-06) |
| Q4 | First to accept wins, or does the host choose among acceptors? | Sales | First to accept wins (BR-03, FR-071) |
| Q5 | Is Completed automatic at planned end, or always partner-confirmed? | Operations | Both, per BRD §7: automatic at the planned end plus manual *Mark complete*; automatic completion sits behind a setting so it can be switched off |
| Q6 | What is the default response deadline, and can each company set its own? | Sales | No default beyond WA-10 (planned start); a per-company default is configurable by an Admin once decided |
| Q7 | Show partner names in dashboard charts? | Product | Names shown; BN-DSH-07 is *Later* in any case |

#### J.2 PRD questions and their working assumptions

| ID | Question | Working assumption | Affects | Owner | Blocking |
|---|---|---|---|---|---|
| PQ-01 | How does a partner whose request was withdrawn or expired see the trip, given one status per trip? | **WA-01** mapping (Appendix B.1, FR-079) | BR-01, BN-ACT-07, BN-ALL-03 | Product | **R1** |
| PQ-02 | Are the BRD's "main tabs" a hard visibility rule? | **WA-02**: no — emphasis, not a restriction (FR-002) | BRD §5, §7 | Product | **R1** |
| PQ-03 | Does "Awaiting response" mean requests waiting on *us* (received) only? | **WA-03**: yes (FR-007) | BN-DSH-01/02 | Product | R1 |
| PQ-04 | Who may create, edit and submit invoices? | **WA-04**: Finance and Admin of the partner company | BN-CLS-04, BN-INV-* | Finance | **R1** |
| PQ-05 | Who may *Mark complete*? | **WA-05**: Partner Coordinator and Admin of the partner company | BN-ACT-04, BRD §7 | Operations | R1 |
| PQ-06 | What happens to pending partners when a Requested trip is edited? | **WA-06**: added → new request + N-01; removed → withdrawn; pending see an "Updated" marker, no extra notification | BN-ACT-04 | Sales | R1 |
| PQ-07 | Starter reason lists for reject, cancel and invoice decline? | **WA-07**: the lists in FR-072, FR-073 and FR-088, configurable per company | BN-ACT-05, BN-INV-06 | Operations / Finance | R1 |
| PQ-08 | Can an In progress trip be cancelled (breakdown, emergency)? | No — BRD §7 has no such transition (ES-05) | BRD §7 | Operations | R1 |
| PQ-09 | For fixed trips, what are "planned start / end" for status transitions? | **WA-09**: first sub-trip start, last sub-trip end | BRD §7, Appendix B.4 | Operations | R1 |
| PQ-10 | If no deadline is set, when does an unanswered request close? | **WA-10**: the deadline defaults to the planned start, and may not be later than it | BN-REQ-08, OBJ-2 | Sales (with Q6) | **R1** |
| PQ-11 | Is a resubmitted Declined invoice a new version of the same number? | **WA-11**: yes — `v2`, `v3`… | BRD §9.6, BN-INV-03 | Finance | R1 |
| PQ-13 | "Host company's currency" (BR-08) versus "company currency" (BRD §9.6 columns) | **WA-17**: all trip and invoice amounts in the host's currency | BR-08, BN-INV-* | Finance | R1 |
| PQ-14 | Trip volume chart: count by submission week or trip-start week? | **WA-14**: submission week | BN-DSH-06 | Product | R1.1 |
| PQ-15 | Exactly which customer data may a partner see "to run the trip"? | **WA-08**: contact person name and phone, sign, group ref., flight no. | BR-04, NFR-05 | Product + DPO | **R1** |
| PQ-16 | Should "Open invoices" be incoming-only or both directions? | **WA-13**: incoming Pending as the headline, outgoing Pending on a second line | BN-DSH-01 | Finance | R1 |
| PQ-17 | Who receives company-level notifications when received trips are department-scoped? | **WA-27**: users with the recipient role whose departments include the trip; all-department users otherwise | BRD §11, BR-09 | Product | R1 |
| PQ-18 | Draft retention? | **WA-18**: delete after 90 days unused, with a warning 7 days before | BN-REQ-02 | Product | R1.1 |
| PQ-19 | Can a partner set an alternative start address, and when? | **WA-19**: the accepted partner, until the trip is In progress | BN-DTL-02 | Operations | R1 |
| PQ-20 | Can comments be edited or deleted? | **WA-20**: no | BN-DTL-04, NFR-04 | Product | R1 |
| PQ-21 | How is a post-acceptance price change agreed in the portal? | **WA-21**: the host proposes, the partner confirms or declines on the detail page | BR-05 | Sales | R1 |
| PQ-22 | What happens when a TEQ trip that is already shared is shared again? | **WA-30**: blocked, with a link to the existing network trip (ES-32) | BN-REQ-09 | Sales | R1 |
| PQ-23 | What should happen to unsent form input when a session expires? | **WA-31**: return to the same URL after sign-in with input preserved in the browser; drafts recommended for long forms (ES-25) | NFR-03, BN-REQ-02 | Product | R1.1 |

*PQ-12 was withdrawn during drafting and merged into PQ-11. Its ID is not reused.*

#### J.3 Working assumptions without a separate question

| ID | Assumption | Where |
|---|---|---|
| WA-12 | Invoice List default sort is trip date descending | FR-040, FR-091 |
| WA-15 | A cancellation item clears from "Needs your action" when the user opens the trip | FR-010 |
| WA-16 | A return time must be after the planned start and not after the planned end | FR-019 |
| WA-22 | A trip whose only invoices are Declined still counts as "not invoiced" | FR-055 |
| WA-23 | Draft invoices may be deleted by their own company; nothing else is ever deleted | FR-095 |
| WA-24 | Invoice numbers are `BN-INV-YYYY-NNNNNN`, unique platform-wide, sequential per year, assigned at creation | FR-083 |
| WA-25 | Archive age is measured from `decided_at` | FR-090 |
| WA-26 | "Invoice date" means the submitted date; Drafts use their created date | FR-091 |
| WA-28 | Exports are capped at 50 000 rows | FR-044, ES-21 |
| WA-29 | The legacy status mapping in Appendix G.2, to be validated in the trial run | FR-110 |

### Appendix K — Section map, PRD v1.0 → v2.0

IDs (BN-*, FR/FEAT/MOD are new but additive, AC-*, ES-*, UJ-*, S-*, DE-*, N-*, M-*, TM-*, T1…T7, I1…I6, DR-*, WA-*, PQ-*) are unchanged. Only section numbers moved. Downstream documents that cite a v1.0 section number should be updated at their next revision (risk RP-5).

| v1.0 section | v2.0 home |
|---|---|
| §1 Product summary · §1.1 Product goals | §1.1, §1.3, §1.4 |
| §2 Users and their jobs | §2 |
| §3.1 / §3.2 Scope | §1.6 / §1.7 |
| §3.3 Release slices | §15.7 |
| §4 User journeys (UJ-01…UJ-08) | §13 |
| §5.1 Navigation bar · §5.2 Routes and URL state · §5.3 Dashboard deep links | Appendix A |
| §6.1 Two records · §6.2 Company-view status | Appendix B.1 and FR-079 |
| §6.3 Transition table (T1…T7) · §6.4 Scheduler rules | Appendix B.2 · Appendix B.4 |
| §7.1 Shared list component | §6.4 (FR-036…FR-046) |
| §7.2 Dashboard | §6.2 (FR-007…FR-016) |
| §7.3 Request | §6.3 (FR-017…FR-035) |
| §7.4 Active Trips and the action matrix | §6.4 (FR-047…FR-050) and §6.6 (FR-069) |
| §7.5 Trip detail page | §6.5 (FR-061…FR-068) |
| §7.6 Closed Trips · §7.7 All Trips | §6.4 (FR-051…FR-060) |
| §7.8 Invoice List (incl. I1…I6) | §6.7 (FR-081…FR-095) and Appendix B.3 |
| §7.9 Notifications (N-01…N-08) | §6.8 (FR-096…FR-099) and Appendix E |
| §7.10 Permissions and visibility | §6.9 (FR-100…FR-104) |
| §8 Business rules — enforcement map | §11 |
| §9 Non-functional requirements — acceptance | §7 (NFR-001…NFR-020) |
| §10 Data requirements (DE-01…DE-13) | Appendix C |
| §11 Integrations | Appendix D |
| §12 Error and edge scenarios (ES-01…ES-24) | §12 (extended to ES-32) |
| §13 Acceptance criteria (AC-*) | §10 |
| §14 Success measurement (M-1…M-5, TM-01…TM-13) | Appendix F |
| §15 Migration and rollout | Appendix G |
| §16 Assumptions and risks | Appendix H |
| §17.1 BRD questions · §17.2 PRD questions and assumptions | Appendix J.1 · Appendix J.2 / J.3 |
| §18 Traceability matrix | §16 |
| §19 References · §20 Revision history | Appendix L |
| *(new in v2.0)* | §3 Stakeholders · §4 Product modules · §5 Feature identification · §8 Feature catalogue · §9 Epics and user stories · §14 Screen inventory · §15 MoSCoW tables · §17 Validation summary · Appendix I (DR register) |

### Appendix L — References and revision history

#### L.1 References

- **BRD:** `docs/planning-artifacts/brd/busnetwork-brd-v1/BRD.md` (BN-BRD-001 v1.0) — source artifact https://claude.ai/artifact/AZaSpLY2GjYovNbUM4BXjK
- **Validation report:** `docs/planning-artifacts/prd/busnetwork-prd-v1/VALIDATION-REPORT.md`
- **SPEC and companions:** `docs/specs/spec-busnetwork-v1-architecture/` (SPEC.md, data-sharing-contract.md, v1-boundaries.md)
- **Architecture Spine:** `docs/planning-artifacts/architecture/architecture-BusNetwork-2026-08-26/ARCHITECTURE-SPINE.md`
- **UX package and prototype:** `docs/planning-artifacts/ux-designs/ux-busnetwork-2026-08-26/` (DESIGN.md, EXPERIENCE.md, SCREENS.md, `prototype/`)
- **Project context:** `docs/PROJECT-CONTEXT.md`

#### L.2 Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-09-15 | Product team | First draft implementing BN-BRD-001. |
| 1.0 | 2026-09-16 | Product team | Final. All 66 BRD requirements specified and covered by acceptance criteria; working assumptions WA-01…WA-29 and questions PQ-01…PQ-21 recorded; release slices R1 / R1.1 / Later fixed. |
| 2.0 | 2026-09-18 | Product team | Restructured to the standard PRD outline without changing a single requirement, rule, priority or assumption. Added: stakeholders (§3), a ten-module structure (§4), feature identification and a 53-feature catalogue (§5, §8), 110 numbered functional requirements (§6), 20 product non-functional requirements covering all required NFR areas (§7), ten epics with 69 user stories (§9), acceptance criteria restated in Given/When/Then and extended to every new story (§10), business rules mapped to feature constraints (§11), edge cases extended to ES-32 with messages and data impact (§12), a screen inventory with six states per screen (§14), MoSCoW tables including *Won't Have* (§15), a full traceability matrix (§16) and a validation summary (§17). Earlier §5–§7, §10–§11, §14–§17 and §19–§20 moved to Appendices A–L (map in Appendix K). New working assumptions WA-30, WA-31 with questions PQ-22, PQ-23; new derived requirements DR-18, DR-19, DR-20. |

---

*BN-PRD-001 · v2.0 Final · Implements BN-BRD-001 v1.0. Requirement IDs stay the same between versions; if a requirement is removed, it is marked withdrawn and its ID is not reused. Where this PRD appears to contradict the BRD, the BRD is right.*
