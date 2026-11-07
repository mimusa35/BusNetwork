---
name: BusNetwork
artifact: EXPERIENCE
status: final
version: 1.0
created: 2026-09-15
updated: 2026-09-16
finalized: 2026-09-16
based_on:
  - ../../brd/busnetwork-brd-v1/BRD.md
  - ../../prd/busnetwork-prd-v1/PRD.md
related:
  - ./DESIGN.md
  - ./SCREENS.md
  - ../../architecture/architecture-BusNetwork-2026-08-26/ARCHITECTURE-SPINE.md
---

# BusNetwork — Experience spine

> Information architecture, behaviour, states, interaction rules, accessibility and journeys for the BusNetwork portal. Implements BN-BRD-001 through BN-PRD-001. Cross-references tokens in `DESIGN.md` and screens in `SCREENS.md` (S-00…S-13). Spines win on conflict with any mock.

## Foundation

| Decision | Choice | Source |
|---|---|---|
| Form factor | Web, inside TEQ; desktop-first at 1280 px, usable down to tablet 768 px | NFR-08 |
| Browsers | Latest two versions of Chrome, Edge, Firefox, Safari | NFR-08 |
| Accessibility floor | WCAG 2.1 AA: full keyboard use, visible focus, status by text label not colour alone | NFR-07 |
| Languages | Norwegian nb_NO (default), English en_US, Swedish sv_SE, Danish da_DK; dates and numbers follow the locale | NFR-06 |
| Sign-in | TEQ's existing login; no BusNetwork-specific accounts | NFR-03, BRD §14 |
| Vocabulary | BRD glossary exactly: host company, partner company, affiliation, price agreement, customer price, offer price, normal/fixed trip, Trip ID, PAX, invoice. The six statuses and four invoice statuses use BRD names only. | BRD §6, §7, §9.6 |
| Out of UX scope | Agreement and rate management, vehicle/driver assignment, accounting export, payments, customer booking portal, mobile driver app | BRD §4 |

## Information architecture

One navigation bar, fixed order; tabs a user can't open are hidden (BRD §7).

| Tab | Screen | Purpose | Primary users | Badge |
|---|---|---|---|---|
| Dashboard | S-01 | What needs my action · what runs soon · how the network is doing | Everyone (landing page) | — |
| Request | S-02 | Create and share a trip in four steps; drafts | Sales, Admin | — |
| Active Trips | S-03 | Work on Requested, Accepted, In progress trips | Sales, Partner Coord. | Open trips |
| Closed Trips | S-04 | Review Completed, Cancelled, Rejected; start invoices | Partner Coord., Finance | — |
| All Trips | S-05 | Search everything; export | Sales, Viewer | — |
| Invoice List | S-07 | Incoming / Outgoing / Archive invoices | Finance | Incoming Pending |

Shared screens: **S-06 Trip detail** (from any trip list, dashboard widget, notification or invoice); **S-08 Invoice** (view/edit); **S-09 Dialogs** (reason, accept, bulk, price change, submit/approve); **S-10 Notifications panel**. Patterns: **S-11 List component**, **S-12 Visibility rules**, **S-13 State catalogue**. **S-00** is the shell.

**Where a trip lives.** The status alone decides the tab (BR-01). When a user's own action moves a trip to another tab, the row leaves the list with a toast "Trip 48213 moved to Closed Trips · View" — never silently.

**Roles vs tabs.** "Main tabs" in BRD §5 set each role's defaults (what the Dashboard links to, what's emphasised); access follows permissions (PRD §5.1, WA-02).

## Voice and tone

Plain, specific, calm. Say what happened, to which trip, and what the user can do next.

| Do | Don't |
|---|---|
| "Request sent to 2 partners. Trip ID 48213." | "Success!" |
| "Already taken — another partner accepted this trip." | "Error 409" / "Oops, too slow!" |
| "End time must be after start time (start 2026-09-20 08:00)." | "Invalid date" |
| "No active trips match these filters. · Clear filters" | "No data" |
| "Trip 48213 was cancelled by Nordic Coaches: Customer cancelled." | "A trip was updated" |
| "Invoice BN-INV-2026-000184 declined: Extra lines not agreed. Edit and resubmit as version 2." | "Declined" |

**Rules.** Name the Trip ID or invoice number. Name the other company. Give reasons verbatim. Use the user's time zone and locale (BN-LST-07). No exclamation marks. Buttons are verbs that match the BRD action names: *Accept, Reject, Edit, Cancel, Comment, Mark complete, Create invoice, Submit, Approve, Decline, Download PDF, Export*.

**Status labels with context.** Closed statuses show their reason when there is one: "Cancelled · Customer cancelled", "Rejected · Expired". For partners whose request was withdrawn: "Cancelled · Another partner accepted" (PRD §6.2).

## Component patterns

Visual specs are in `DESIGN.md`.

| Component | Behaviour |
|---|---|
| **Navigation bar** (S-00) | Six tabs, fixed order; hidden when not permitted; badges update within 5 minutes and immediately after the user's own action; arrow keys move between tabs. |
| **List toolbar** (S-11) | Search (debounced 300 ms) · date range · company · direction · status · list-specific filters · Export. Active filters show as removable chips with "Clear filters". All state in the URL (BN-LST-06). |
| **Table** (S-11) | Row = link to detail (click or Enter). Sortable headers show direction and `aria-sort`. Actions in the last column: primary action as a button, others in a "More" menu. Via stops and truncated reasons in keyboard-reachable tooltips. |
| **Pagination** (S-11) | "1–25 of 1 284" · page size 10/25/50/100 · previous/next · page jump. No infinite scroll. |
| **Status pill** | Label + icon + colour; closed statuses may append a reason in the row tooltip. |
| **KPI tile** (S-01) | Whole tile is one link to the filtered list; shows value, label and a one-line definition. |
| **Needs your action** (S-01) | Grouped by type with counts; each item names the trip and what's needed; opens the trip or invoice; clears per PRD §7.2. |
| **Stepper form** (S-02) | Four steps; Next validates the current step only; Back keeps data; step labels are buttons for completed steps; errors summarised at the top with links to fields; Save draft on every step (R1.1). |
| **Address field** | Google Maps autocomplete; value only valid when chosen from suggestions; via stops reorder by drag *or* Move up/Move down buttons. |
| **Price table** (S-02 step 3) | One row per partner: agreement, rate, calculated price, editable offer price, additional costs. Editing shows "Overridden" with a Reset link. Rows with no agreement are highlighted until a price is entered. |
| **Reason dialog** (S-09) | Required for Reject, Cancel and invoice Decline: radio list + *Other* textarea; the confirm button names the action and trip ("Reject trip 48213"); focus starts on the first reason. |
| **Accept dialog** (S-09) | Shows offer price, additional costs, start, route; "Accept trip 48213". If the trip changed since the page loaded, shows "Details changed" and the differences first. |
| **Comment thread** (S-06) | Newest at bottom; composer at the bottom; Ctrl/Cmd+Enter posts; unread comments marked until viewed; no edit/delete. |
| **History log** (S-06) | Newest first; filter by Status / Price / Edits; before → after values. |
| **Invoice editor** (S-08) | Line table with add/remove (Draft only); live totals; Submit validates lines; Approved/Declined versions are read-only with a version switcher. |
| **Toast** | For completed actions, with a link ("View"). 6 s; paused on hover/focus; announced via polite live region. |
| **Banner** | For page-level conditions: consistency flag, service unavailable, filters removed. Not dismissible while the condition holds. |
| **Notifications panel** (S-10) | Bell in the top bar; unread count; list of N-01…N-08 items with deep links; "Mark all read". |

## State patterns

Full per-screen coverage in `SCREENS.md` S-13.

| State | Treatment |
|---|---|
| Loading | Skeleton rows/tiles matching the final layout; the toolbar stays usable. |
| Empty — filtered | "No {list} trips match these filters." + Clear filters (BN-LST-08). |
| Empty — nothing yet | Explains the list and offers the next step ("Create a request" for Sales/Admin). |
| Error — load failed | Inline banner "Couldn't load trips. Try again." + Retry; filters kept. |
| Service dependency down | Specific banner naming the dependency (Maps, TEQ Sales, BusNetwork Settings) and what's blocked (PRD §11). |
| Action refused | Dialog stays open with the specific message (ALREADY_TAKEN, REQUEST_EXPIRED, TRIP_CLOSED…), and the row/detail refreshes. |
| Row moved tabs | Toast with link to the new tab. |
| Stale dashboard | "Updated HH:MM" always visible; Refresh button; data never older than 5 min (BN-DSH-08). |
| Starts < 24 h | Flag on Requested rows (BN-ACT-08). |
| Consistency flag | Warning banner on detail listing differing fields (BRD §14 risk). |
| Read-only (closed / Viewer) | Actions not shown; a quiet "Closed trips can't be changed" note on detail; comments remain for roles that can comment. |

## Interaction primitives

- **Keyboard.** Every action reachable by Tab/Shift+Tab; Enter opens rows; Space toggles checkboxes; Esc closes dialogs and menus; arrow keys within tabs, menus and radio groups. Focus returns to the triggering element when a dialog closes.
- **Shortcuts (optional, discoverable via `?`).** `/` focuses search; `g d`, `g r`, `g a`, `g c`, `g l`, `g i` go to tabs.
- **Hover never required.** Anything in a tooltip (via stops, full reasons, calculated price) is also available on focus and on the detail page.
- **Confirmation only when it matters.** Reason dialogs for destructive actions; Accept, Submit and Approve confirm with a summary. Comments, filters and drafts don't confirm.
- **Undo.** Not offered for state changes (they notify the other company and are audited). Filter changes are undone with browser Back.
- **Bulk (Later, BN-ACT-09).** Checkbox column appears only on rows where the bulk action is allowed; results reported per trip.
- **Banned.** Infinite scroll, auto-advancing carousels, colour-only meaning, drag-only interactions, modals opening modals.

## Accessibility floor (WCAG 2.1 AA — NFR-07)

- **Perceivable.** Text contrast ≥ 4.5:1, UI ≥ 3:1 (tokens in `DESIGN.md` checked in light and dark). Status = label + icon + colour. Map has a text route summary. Charts have a data table alternative.
- **Operable.** Full keyboard operation; visible 2px focus ring; no keyboard traps; skip link to main content; drag reorder has buttons; time-outs don't apply to forms (drafts autosave where enabled).
- **Understandable.** Labels on every field; errors next to the field and summarised at the top with links; error text says how to fix (BN-REQ-10); consistent navigation order (BRD §7); language attribute set per locale.
- **Robust.** Semantic tables with `<th scope>`; `aria-sort` on sortable headers; dialogs with `role="dialog"`, labelled, focus-trapped; live regions for toasts and list result counts; badges have accessible names ("Active Trips, 24 open").
- **Verification.** Automated axe checks in CI; manual keyboard + NVDA/VoiceOver pass on UJ-01…UJ-08 each release (PRD AC-A11Y.1).

## Key flows

Named-protagonist versions of PRD §4. Each lists the screens touched and the moment that shows the product's value.

### UJ-01 — Ingrid shares a trip with two partners (Sales, host)

S-01 → Sales › Network Trips *Share* → **S-02** steps 1–4 → success → S-03.
Ingrid shares a Saturday Oslo → Bergen trip. Step 3 shows 17 000 for Fjord Buss (85%) and 16 500 for Nordfjord (full day); she nudges Nordfjord to 16 800 and sees "Overridden by Ingrid Hansen". She sets a response deadline for Thursday 12:00.
**Value moment:** one form, two partners, prices from their agreements — no calls, no spreadsheet.

### UJ-02 — Lars accepts; Magnus is too late (Partner Coordinators)

S-01 *Awaiting response 3* → **S-03** (Requested, received) → S-06 → **S-09 Accept** → toast → S-03.
Magnus at Nordfjord presses Accept seconds later and sees "Already taken — another partner accepted this trip." His list now shows the trip as Cancelled · Another partner accepted.
**Value moment:** exactly one partner has the trip, and everyone knows immediately.

### UJ-03 — Magnus rejects with a reason (Partner Coordinator)

S-03 → **S-09 Reason** ("No vehicle available") → row leaves his Active list; toast links to Closed Trips.
Ingrid still sees Requested while Fjord Buss hasn't answered.

### UJ-04 — Ingrid cancels an accepted trip (Sales, host)

S-06 → **S-09 Reason** ("Customer cancelled") → trip moves to Closed Trips.
Lars gets an email and, because the trip starts within 24 h, an SMS.

### UJ-05 — The trip runs and completes (System, Lars)

S-03 shows In progress after planned start; Lars uses **Mark complete** on arrival; S-04 shows Completed · Not invoiced.

### UJ-06 — Olav invoices the trip (Finance, partner)

**S-04** quick filter *Completed, not invoiced* → *Create invoice* → **S-08** Draft prefilled (offer price 17 000 + ferry 1 200, 25% VAT) → adds waiting time → **Submit**.
**Value moment:** the invoice starts from the trip; nothing is retyped.

### UJ-07 — Sofie approves or declines (Finance, host)

S-01 *Open invoices* → **S-07 Incoming** (Pending) → S-08 → **Approve** (amounts lock) or **S-09 Decline** with a reason → Olav edits version 2 and resubmits.

### UJ-08 — Management exports last quarter (Viewer)

**S-05** status group *Closed* + date range → count matches Closed Trips → **Export XLSX** with status history.

## Responsive & platform

| Width | Behaviour |
|---|---|
| ≥ 1280 px | Full layout: detail in two columns; dashboard 5 KPI tiles in one row |
| 1024–1279 px | Dashboard KPI tiles wrap 3 + 2; detail side panel narrows |
| 768–1023 px | Tabs scroll horizontally; filters in a drawer; tables scroll inside their card; detail single column; request form full width |
| < 768 px | Not a supported target (NFR-08); layout remains readable but untested |

## Open markers

- `[PQ-01]` Partner-side labels for withdrawn/expired requests depend on PRD PQ-01.
- `[PQ-02]` Tab visibility per role depends on PRD PQ-02.
- `[Q5]` *Mark complete* stays visible until Q5 is answered.
- `[TEQ]` Top bar, notification bell and user menu reuse TEQ's shell if one exists.
