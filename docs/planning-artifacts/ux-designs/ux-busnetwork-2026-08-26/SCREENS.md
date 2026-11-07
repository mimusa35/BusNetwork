---
name: BusNetwork
artifact: SCREENS
status: final
version: 1.0
created: 2026-09-15
updated: 2026-09-16
finalized: 2026-09-16
based_on:
  - ./DESIGN.md
  - ./EXPERIENCE.md
  - ../../prd/busnetwork-prd-v1/PRD.md
  - ../../brd/busnetwork-brd-v1/BRD.md
related:
  - ./prototype/README.md
---

# BusNetwork — Screens

> Every screen, field, action and state of the BusNetwork portal. `DESIGN.md` and `EXPERIENCE.md` override this document. Requirement IDs are BN-BRD-001; section references (§) are BN-PRD-001. A clickable prototype of these screens is in `prototype/`.

## Screen index

| ID | Screen | Route (PRD §5.2) | BRD |
|---|---|---|---|
| S-00 | Shell and navigation | — | §7, BN-INV-08 |
| S-01 | Dashboard | `/busnetwork` | BN-DSH-01…08 |
| S-02 | Request (4 steps, drafts, success) | `/busnetwork/request` | BN-REQ-01…10 |
| S-03 | Active Trips | `/busnetwork/trips/active` | BN-ACT-01…09 |
| S-04 | Closed Trips | `/busnetwork/trips/closed` | BN-CLS-01…07 |
| S-05 | All Trips | `/busnetwork/trips/all` | BN-ALL-01…06 |
| S-06 | Trip detail | `/busnetwork/trips/<id>` | BN-DTL-01…06, BR-05 |
| S-07 | Invoice List | `/busnetwork/invoices/<tab>` | BN-INV-01, 02, 07, 08, 10 |
| S-08 | Invoice (view / edit) | `/busnetwork/invoices/<no>` | BN-CLS-04, BN-INV-03…07, 09 |
| S-09 | Dialogs | — | BN-ACT-05…07, 09, BN-INV-06, BR-05 |
| S-10 | Notifications panel | — | BRD §11 |
| S-11 | List component (shared) | — | BN-LST-01…10 |
| S-12 | Visibility rules | — | BR-04, BR-09, NFR-05 |
| S-13 | State catalogue | — | BN-LST-08, BN-DSH-08 |

---

## S-00 — Shell and navigation

**Top bar (TEQ).** BusNetwork logo (links to Dashboard; see DESIGN *Logo*) · company name (and company switcher if the user has several) · notification bell with unread count (S-10) · user menu (language, time zone, sign out).

**Navigation bar.**

```
● BusNetwork | Dashboard | Request | Active Trips (24) | Closed Trips | All Trips | Invoice List (3)
```

| Element | Rule |
|---|---|
| Order | Fixed as above (BRD §7) |
| Visibility | Hidden when the user can't open the tab (PRD §5.1) |
| Active Trips badge | Open trips in the user's scope (all three active statuses) |
| Invoice List badge | Incoming Pending invoices (BN-INV-08); `amber-soft` when > 0 |
| Selected tab | `accent` underline; `aria-current="page"` |
| Keyboard | Tab into bar, arrow keys between tabs, Enter to open |

---

## S-01 — Dashboard

**Purpose.** Answer, in order: what needs my action now, what's running soon, how is the network doing (BRD §9.1).

**Header.** "Dashboard" · period selector (This week / This month / Last 30 days / Custom — BN-DSH-05, R1.1) · "Updated 14:32" + Refresh (BN-DSH-08).

**Row 1 — key figures (BN-DSH-01, BN-DSH-02).** Five tiles, each a link:

| Tile | Value | Sub-line | Opens |
|---|---|---|---|
| Awaiting response | count | "Requests waiting on us" | Active Trips · Requested · Received |
| Active trips | count | "Accepted + in progress" | Active Trips · Accepted, In progress |
| Starting next 7 days | count | "Trip count" | Active Trips · Accepted, In progress · next 7 days |
| Closed this month *(label follows period)* | count | "Completed trips" | Closed Trips · Completed · period |
| Open invoices | `12 450,00 NOK` | "3 to approve · 8 900,00 NOK awaiting partner" | Invoice List · Incoming · Pending |

**Row 2.**

| Widget | Content | Interactions |
|---|---|---|
| **Upcoming trips** (2/3 width, BN-DSH-03) | Table of next 10 Accepted/In progress trips: Trip ID · start · route · PAX · company · status | Row → S-06; "View all" → Active Trips sorted by start |
| **Needs your action** (1/3 width, BN-DSH-04) | Groups with counts: *Incoming requests* · *Cancellations* · *Invoices to approve* · *Unread comments*. Item line: "Trip 48213 · Oslo → Bergen · respond by 18 Sep 12:00" | Item → S-06 / S-08; group header → filtered list |

**Row 3.**

| Widget | Content |
|---|---|
| **Trip volume** (2/3, BN-DSH-06, R1.1) | Grouped bars per week, last 12 weeks: Shared (accent) vs Received (blue); legend with labels; "View as table" toggle for accessibility |
| **Top partners** (1/3, BN-DSH-07, Later) | Ranked list of 5 companies with completed-trip counts and a bar; names per Q7 |

**Role differences.** Tiles and groups show only what the role can act on or view: a Viewer sees all figures but "Needs your action" is replaced by "Recent activity" (latest status changes); Finance's *Needs your action* shows invoices first.

**States.** Loading skeleton tiles; zero values show "0" (not empty); widget-level error with Retry (others still render).

---

## S-02 — Request

**Layout.** Page title "New request" (or "Edit request · Trip 48213"). Left: route-line stepper (1 Trip details · 2 Select partners · 3 Set price · 4 Review & submit). Right: step content. Footer bar: *Save draft* (R1.1) · *Back* · *Next* / *Submit request*.

**Entry banner** when prefilled: "Prefilled from TEQ trip 48213. Check the details before sharing."

### S-02.1 — Step 1: Trip details

| Group | Fields (rules in PRD §7.3) |
|---|---|
| Trip | Trip type (Normal / Fixed segmented control) · Round trip checkbox |
| Customer | Customer (search + "New customer") · Contact person |
| Route | From · Via stops (0–8, drag handle + Move up/down, Remove) · To · map preview with route and computed trip length |
| Schedule | Planned start · Planned end · Return date/time (round trip only) |
| Passengers & vehicle | PAX (hidden-optional for fixed trips with passenger count off) · Vehicle type · Euro class · Fuel type · Luggage · Other requirements |
| Shifts (Fixed only) | Shift cards: name + sub-trips (from, to, start, end); Add shift / Add sub-trip |
| References | Flight no. · Group ref. · Sign |
| Comments | To partner · To driver · HQ (host only) · Invoice comment · Invoice reference |
| Attachments | Drop zone / file picker: "Up to 2 files, 10 MB each (PDF, JPG, PNG, DOCX)" |

Validation on Next; error summary at top with links; inline messages under fields (BN-REQ-10).

### S-02.2 — Step 2: Select partners

Search box · sort (Name A–Z / Z–A) · table with checkbox column:

| ☐ | Partner | Category | Price agreement | Rate |
|---|---|---|---|---|
| ☑ | Fjord Buss AS | Coach operator | Percentage | 85 % |
| ☑ | Nordfjord Reiser | Coach operator | Full day | 16 500,00 NOK |
| ☐ | Vest Minibuss | Minibus | Half day | 7 900,00 NOK |
| ☐ | Tind Transport | Coach operator | None | — |

Only accepted affiliations (BN-REQ-03). Selected count shown: "2 partners selected". Empty: "No accepted partners yet. Partnerships are set up in BusNetwork Settings."

### S-02.3 — Step 3: Set price

Customer price field (prefilled) · currency (host currency, read-only) · response deadline (BN-REQ-08).

| Partner | Agreement | Calculated | Offer price | Additional costs (R1.1) |
|---|---|---|---|---|
| Fjord Buss AS | 85 % | 17 000,00 | `17 000,00` | + Add cost |
| Nordfjord Reiser | Full day | 16 500,00 | `16 800,00` *Overridden by you · Reset* | Ferry 1 200,00 × |
| Tind Transport | None | 0,00 | `[ required ]` ⚠ "Enter an offer price — there is no price agreement." | + Add cost |

Info line under the table: "Offer prices use standard rounding to 2 decimals." Overrides are recorded with your name (BN-REQ-05).

### S-02.4 — Step 4: Review & submit

Read-only summary cards: Trip · Route & schedule · Passengers & vehicle · Partners & prices · Comments & attachments — each with **Edit** jumping to its step. Primary: **Submit request**. While submitting the button shows progress and is disabled.

### S-02.5 — Drafts (R1.1)

On the Request tab above the empty form: "My drafts (2)" table — Last edited · Trip type · Route · Step · Open · Delete. Opening resumes at the saved step.

### S-02.6 — Success

"Request sent to 2 partners." · Trip ID `48213` (mono) · "Marked as shared on TEQ trip 48213" · buttons **Open in Active Trips** · **Create another request**.

---

## S-03 — Active Trips

**Title** "Active Trips" + total. **Toolbar** (S-11) with: Direction segmented control (All · Shared by us · Received by us — BN-ACT-02) · Status multi-select (Requested, Accepted, In progress — BN-ACT-03) · shared filters · Export (R1.1).

**Columns.** Standard trip columns (BRD §8, Active set): Trip ID · Trip start · Trip length · From – To · PAX · Shift · Company · Type · Price · Status · Comments · Actions.

**Row actions** (PRD §7.4 matrix):

| Row situation | Buttons |
|---|---|
| Requested · Received | **Accept** · Reject |
| Requested · Shared | Edit · Cancel |
| Accepted | Comment · Cancel |
| In progress · Received | **Mark complete** · Comment |
| In progress · Shared | Comment |

**Flags.** Requested + start < 24 h → "⏱ Starts < 24 h" under the status pill (BN-ACT-08). Requested + shared to several partners → Price shows "2 prices" with tooltip.

**Bulk (Later).** Checkbox column on Requested·Received rows; bar "3 selected · Accept · Reject".

**Default sort** Trip start ascending.

---

## S-04 — Closed Trips

**Toolbar:** Status multi-select (Completed, Cancelled, Rejected) · Direction · Closed date range (BN-CLS-02) · quick-filter chip **Completed, not invoiced** (BN-CLS-07) · shared filters · Export.

**Columns:** standard columns + **Closed date** + **Invoice**. Status cell for Cancelled/Rejected shows the reason truncated with tooltip (BN-CLS-03).

**Row actions:** Completed · Received · no invoice → **Create invoice** (Finance/Admin); any with invoice → View invoice; all → Comment (roles that can comment). No edit or status actions (BN-CLS-06).

**Default sort** Trip start descending.

---

## S-05 — All Trips

**Toolbar:** grouped status filter —

```
☐ Active        ☐ Closed
  ☐ Requested     ☐ Completed
  ☐ Accepted      ☐ Cancelled
  ☐ In progress   ☐ Rejected
```

· Direction · shared filters · **Columns** chooser (Later) · Export (R1.1, includes status history).

**Count line** mirrors BN-ALL-03: "412 trips (Active 37 · Closed 375)" for the current filters.

**Columns:** all standard columns incl. Closed date and Invoice. **Row actions:** identical to S-03/S-04 for the row's status (BN-ALL-04). **Default sort** Trip start descending.

---

## S-06 — Trip detail

**Header (full width).** Back to list · Trip ID `48213` · status pill (+ reason) · type · "Host: Nordic Coaches → Partner: Fjord Buss AS" (partner view shows only its own company) · action buttons (same matrix as the list — BN-DTL-06).

**Banners (when applicable).** Consistency flag; "Closed trips can't be changed"; "Price change proposed — waiting for Fjord Buss" / "Nordic Coaches proposes 18 000,00 NOK · Confirm · Decline" (BR-05).

**Main column.**

| Section | Content |
|---|---|
| Route & map | Map with route; ordered stop list From → vias → To; alternative start address replaces From with "Original: …" note (BN-DTL-02); trip length |
| Schedule | Planned start · end · return · response deadline |
| Passengers & vehicle | PAX · vehicle requirements |
| Shifts *(fixed)* | Shift cards with sub-trips (BN-DTL-03) |
| Pricing | Host: customer price; table of partners with offer price, override marker, additional costs, response state. Partner: own offer price and additional costs only |
| Customer & references | Host: customer, contact, flight no., group ref., sign. Partner: contact name + phone, flight no., group ref., sign (S-12) |
| Comments fields | To partner · To driver · Invoice reference (both); HQ · Invoice comment (host only) |
| Attachments | File list with type, size, uploaded by/at, Download |
| History | Timeline (BN-DTL-05) with filter chips: All · Status · Price · Edits |

**Side panel.**

| Block | Content |
|---|---|
| Status | Pill, since when, next automatic change ("Moves to In progress at 2026-09-20 08:00") |
| Partner responses *(host)* | Per partner: state pill, responded by/at, reason |
| Invoice *(closed)* | Invoice status + link, or Create invoice |
| Comments | Thread (BN-DTL-04) — host sees a partner switcher when several partners commented; composer |

---

## S-07 — Invoice List

**Sub-tabs:** Incoming (badge = Pending) · Outgoing · Archive (BN-INV-01). Visible sub-tabs depend on side: Finance users of a company that is both host and partner see all three.

**Toolbar:** search (Trip ID, invoice no., company) · Status · Company · Trip date range · Invoice date range (BN-INV-02) · Export.

**Columns (BRD §9.6):** Invoice no. · Direction · Trip ID · Company · Customer *(host only)* · Trip date · Amount excl. VAT · VAT · Total · Status · Submitted · Decided · Actions.

**Row actions:** Incoming Pending → **Approve** · Decline · View · PDF. Outgoing Draft → Edit · **Submit** · Delete draft · PDF. Outgoing Declined → **Edit & resubmit** · View · PDF. Others → View · PDF.

**Footer (BN-INV-10, R1.1):** "Totals for 60 invoices: 142 300,00 · 35 575,00 · 177 875,00 NOK" (one row per currency if mixed).

**Default sort** Trip date descending.

---

## S-08 — Invoice (view / edit)

**Header.** Invoice no. `BN-INV-2026-000184` · version switcher (v1 Declined · v2 Pending) · status pill · direction · Trip ID link · issuer → recipient.

**Parties.** Two cards with company name, address, org no., VAT no. (from TEQ Company Settings).

**Lines.**

| Description | Qty | Unit price | VAT % | Net | VAT |
|---|---|---|---|---|---|
| Trip 48213, 2026-09-20, Oslo → Bergen | 1 | 17 000,00 | 25 | 17 000,00 | 4 250,00 |
| Ferry | 1 | 1 200,00 | 25 | 1 200,00 | 300,00 |
| Waiting time (hours) | 2 | 450,00 | 25 | 900,00 | 225,00 |
| **Totals** | | | | **19 100,00** | **4 775,00** |

Total incl. VAT **23 875,00 NOK**. Draft: rows editable, "+ Add line", remove per line (BN-INV-05). Invoice comment and invoice reference shown from the trip.

**Actions.** Partner Draft: Save · **Submit** · Delete draft. Host Pending: **Approve** · Decline (S-09). Declined (partner): **Edit & resubmit** → creates next version. All: Download PDF (BN-INV-09).

**Decision block** (Approved/Declined): decided by, at, decline reason; "Amounts locked at approval" note (BN-INV-07).

---

## S-09 — Dialogs

| Dialog | Content | Confirm label | Validation / outcome |
|---|---|---|---|
| **Accept** | Trip ID, start, route, PAX, offer price, additional costs; "Other partners' requests will be withdrawn." | Accept trip 48213 | Refusals shown in-dialog: Already taken · Expired · Cancelled by host |
| **Reject** | Reason radio list (PRD WA-07) + *Other* text | Reject trip 48213 | Reason required; outcome toast "Trip 48213 rejected. It's now in Closed Trips." |
| **Cancel** | Reason list + text; warning if start < 24 h: "The other company will also get an SMS." | Cancel trip 48213 | Reason required |
| **Mark complete** | "Mark trip 48213 as completed now? It moves to Closed Trips and can be invoiced." | Mark complete | — |
| **Bulk accept / reject** (Later) | Selected trips list; one reason for reject | Accept 3 trips / Reject 3 trips | Per-trip result summary |
| **Propose price change** (BR-05) | Current price, new price, comment (required) | Send proposal | Partner confirms/declines on S-06 |
| **Submit invoice** | Totals summary | Submit invoice | Lines valid |
| **Approve invoice** | Totals; "Amounts will be locked." | Approve invoice | — |
| **Decline invoice** | Reason list + text | Decline invoice | Reason required |

All dialogs: focus on first field; Esc cancels; focus returns to trigger; errors inline.

---

## S-10 — Notifications panel

Bell opens a 360 px panel: tabs *Unread* / *All*; item = icon · text (PRD §7.9 templates) · relative time · deep link; "Mark all read"; link to notification settings (per-event channel toggles, daily summary — BRD §14 mitigation).

---

## S-11 — List component (shared)

Used by S-03, S-04, S-05, S-07.

```
┌ Title · total ─────────────────────────────────────────────── [Export ▾] ┐
│ [🔍 Search trip ID, address, company, group ref.] [Trip start: from–to] │
│ [Company: All companies ▾] [list-specific filters…]                      │
│ Chips: Status: Requested ×  Direction: Received ×   Clear filters        │
├──────────────────────────────────────────────────────────────────────────┤
│ Trip ID ▲ │ Trip start │ Length │ From – To │ PAX │ … │ Status │ Actions  │
│ …                                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│ 1–25 of 137        Rows per page [25 ▾]        ‹ Prev  1 2 3 … 6  Next › │
└──────────────────────────────────────────────────────────────────────────┘
```

| Behaviour | Rule |
|---|---|
| Paging | 10/25/50/100, default 25, total shown (BN-LST-01) |
| Search | Trip ID, from/to address, company name, group ref. (BN-LST-02) |
| Date range | Trip start; whole days in user time zone (BN-LST-03) |
| Company | "All companies" default; partners/hosts by side (BN-LST-04) |
| Sort | Trip ID, start, length, PAX, price; defaults per list (BN-LST-05) |
| URL | Everything in the URL (BN-LST-06) |
| Formats | `YYYY-MM-DD HH:MM`, `Xh Ym` (BN-LST-07) |
| Empty | Reason + Clear filters (BN-LST-08) |
| Export | CSV / XLSX of all matching rows (BN-LST-09) |
| Return | Filters and scroll restored after detail (BN-LST-10) |

---

## S-12 — Visibility rules

Authoritative source: `specs/…/data-sharing-contract.md` §2. Summary for designers:

| Shown to host only | Shown to both | Shown to a partner only about itself |
|---|---|---|
| Customer price · customer company & billing · HQ comment · invoice comment · all partners' prices and responses · who overrode a price · Invoice List *Customer* column | Trip ID, type, status, schedule, route, alt. start, PAX, vehicle, shifts, flight no., group ref., sign, contact person name & phone, comment to partner/driver, invoice reference, attachments, history of trip fields | Its own offer price, additional costs, response, comment thread with the host |

Department scope (BR-09): items outside the user's departments never appear in lists, counts, badges, exports or notifications.

---

## S-13 — State catalogue

| Screen | Loading | Empty (filtered) | Empty (none yet) | Error | Special |
|---|---|---|---|---|---|
| S-01 Dashboard | Skeleton tiles/widgets | — | Tiles show 0; widgets "Nothing waiting on you" / "No upcoming trips" | Per-widget Retry | "Updated HH:MM"; data ≤ 5 min |
| S-02 Request | Prefill skeleton | — | Blank form | Dependency banner (Maps, TEQ Sales, BusNetwork Settings) | Validation summary; submit refused (affiliation ended) |
| S-03 Active | Skeleton rows | "No active trips match these filters." + Clear | "No active trips right now." + Create a request | Banner + Retry | < 24 h flag; row moved toast |
| S-04 Closed | Skeleton rows | "No closed trips match these filters." + Clear | "No closed trips yet." | Banner + Retry | Reason tooltip |
| S-05 All | Skeleton rows | "No trips match these filters." + Clear | "No trips yet." | Banner + Retry | Active/Closed split in count |
| S-06 Detail | Section skeletons | — | — | "Trip not found." (incl. out of scope) | Consistency flag; closed read-only; price-change proposal |
| S-07 Invoices | Skeleton rows | "No incoming invoices match these filters." + Clear | "No invoices yet. Invoices are created from Completed trips." | Banner + Retry | Archive after 90 days |
| S-08 Invoice | Skeleton | — | — | "Invoice not found." | Locked amounts note; version switcher; invoice exists refusal |
| S-09 Dialogs | Button progress | — | — | In-dialog refusal message | Already taken / Expired / Cancelled |
