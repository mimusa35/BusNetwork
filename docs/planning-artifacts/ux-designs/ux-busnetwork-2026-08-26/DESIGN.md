---
name: BusNetwork
artifact: DESIGN
status: final
version: 1.0
created: 2026-09-15
updated: 2026-10-04
finalized: 2026-09-16
based_on:
  - ../../brd/busnetwork-brd-v1/BRD.md
  - ../../prd/busnetwork-prd-v1/PRD.md
related:
  - ./EXPERIENCE.md
  - ./SCREENS.md
  - ./prototype/README.md
---

# BusNetwork — Design spine

> Visual identity for the BusNetwork portal. Paired with `EXPERIENCE.md` (behaviour) and `SCREENS.md` (every screen). The palette and type follow the BN-BRD-001 artifact so the requirements document and the product read as one system. Spine wins on conflict with any mock.

## Brand & style

**A TEQ module, not a separate product.** BusNetwork lives inside TEQ, behind TEQ's login, next to *Sales* and *Planning* (BRD §14 constraint). Its identity is a quiet accent on TEQ's back-office conventions; if TEQ's design system imposes components or a wordmark, those win and these tokens map onto them.

**Logo.** A coach in side view (`prototype/logo.svg`), in accent teal `#55C4A8` with the bar colour `#132029` for windows and wheels. It sits at the far left of the top bar in place of the TEQ wordmark, at 40 × 32 px, and links to the Dashboard. The same mark is the browser-tab icon. It is decorative to screen readers inside a link labelled "BusNetwork — go to Dashboard". Added 2026-10-04 at the product owner's request. If TEQ's shell is reused (EXPERIENCE `[TEQ]`), the logo goes at the left of TEQ's top bar.

**Posture.** Operational, dense, calm. Built for a dispatcher answering requests between own-fleet work and a finance user clearing a queue — not for browsing.

**Motif.** The route line: a thin vertical line with stops, used sparingly (request stepper, status legend, empty states). It echoes how operators already think about a trip.

## Colors

All text pairs meet WCAG 2.1 AA (4.5:1); UI boundaries and focus rings meet 3:1 (NFR-07). Status is never shown by colour alone — every pill carries its text label.

```yaml
colors:
  light:
    ground: '#F2F5F6'        # page background
    paper: '#FFFFFF'         # cards, tables, panels
    ink: '#132029'           # primary text
    ink-2: '#45545E'         # secondary text
    ink-3: '#6B7A83'         # tertiary text, table headers (use ≥ 12px)
    rule: '#D3DCE0'          # borders
    rule-soft: '#E6EBED'     # row dividers
    accent: '#0B6B5A'        # primary actions, selected tab, focus ring
    accent-soft: '#DDEFEA'
    amber: '#8F5500'
    amber-soft: '#FBEFD8'
    red: '#A13A2C'
    red-soft: '#F6E2DE'
    blue: '#1E5886'
    blue-soft: '#E1ECF5'
    grey: '#55636B'
    grey-soft: '#E8EDEF'
  dark:
    ground: '#0D1418'
    paper: '#131C21'
    ink: '#E1E8EB'
    ink-2: '#A7B4BB'
    ink-3: '#7C8A92'
    rule: '#27333A'
    rule-soft: '#1C262C'
    accent: '#55C4A8'
    accent-soft: '#143530'
    amber: '#E4A74C'
    amber-soft: '#382A13'
    red: '#E68B7C'
    red-soft: '#3A1F1B'
    blue: '#80B5E2'
    blue-soft: '#172A3A'
    grey: '#A2AFB6'
    grey-soft: '#1F2A30'
```

### Status colour map

One mapping, used by pills, dashboard legends, charts and exports' colour-coded views.

| Status (code) | Label | Text token | Fill token | Icon |
|---|---|---|---|---|
| `REQUESTED` | Requested | `amber` | `amber-soft` | hollow circle |
| `ACCEPTED` | Accepted | `accent` | `accent-soft` | check |
| `IN_PROGRESS` | In progress | `blue` | `blue-soft` | play |
| `COMPLETED` | Completed | `grey` | `grey-soft` | flag |
| `CANCELLED` | Cancelled | `red` | `red-soft` | x |
| `REJECTED` | Rejected | `red` | `red-soft` | minus |

| Invoice status | Label | Text token | Fill token |
|---|---|---|---|
| `DRAFT` | Draft | `grey` | `grey-soft` |
| `PENDING` | Pending | `amber` | `amber-soft` |
| `APPROVED` | Approved | `accent` | `accent-soft` |
| `DECLINED` | Declined | `red` | `red-soft` |

| Other signal | Treatment |
|---|---|
| "Starts < 24 h" flag (BN-ACT-08) | `amber` text + clock icon + label |
| Unread comments | `accent` dot + count in bold |
| Consistency flag | `amber-soft` banner with `amber` border-left |
| Error / validation | `red` text, `red` input border, icon |

## Typography

```yaml
typography:
  display:   { family: '"Barlow Semi Condensed", "Arial Narrow", "Helvetica Neue", Arial, sans-serif', weights: [600, 700] }
  body:      { family: '"Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', weights: [400, 500, 600] }
  mono:      { family: '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace', weights: [400, 500] }
  scale:
    page-title:   { family: display, size: 30px, weight: 600, line: 1.1 }
    section:      { family: display, size: 21px, weight: 600, line: 1.2 }
    kpi-value:    { family: display, size: 34px, weight: 700, line: 1.0, numeric: tabular }
    body:         { family: body, size: 14px, weight: 400, line: 1.5 }
    body-strong:  { family: body, size: 14px, weight: 600, line: 1.5 }
    small:        { family: body, size: 12.5px, weight: 400, line: 1.45 }
    label:        { family: mono, size: 10.5px, weight: 500, line: 1.3, tracking: 0.1em, case: upper }
    id:           { family: mono, size: 13px, weight: 400, line: 1.4 }   # Trip ID, invoice no.
    amount:       { family: body, size: 14px, weight: 500, numeric: tabular, align: right }
```

- **Display** (Barlow Semi Condensed) for page titles, section headings and KPI numbers — narrow, reads as signage.
- **Body** (Public Sans) for everything users read and type.
- **Mono** (JetBrains Mono) for Trip IDs, invoice numbers, table headers and field labels, so IDs can be read aloud on the phone without ambiguity.
- Every face has a system fallback; the portal must be fully legible if web fonts fail.

## Layout & spacing

```yaml
spacing: { 1: 4px, 2: 8px, 3: 12px, 4: 16px, 5: 24px, 6: 32px, 7: 48px }
layout:
  max-width: 1440px
  gutter: 24px            # 16px below 1024px
  nav-height: 52px
  detail-side-panel: 360px
breakpoints:
  desktop: 1280px          # design target (NFR-08)
  laptop: 1024px
  tablet: 768px            # minimum supported (NFR-08)
radius: { sm: 3px, md: 6px, lg: 10px, pill: 999px }
```

- **Shell:** top bar (BusNetwork logo, company, user) → BusNetwork navigation bar (six tabs) → page.
- **Lists:** full-width table in a `paper` card; toolbar above (search, filters, export); pagination below.
- **Detail:** two columns at ≥ 1280 px (main content | side panel with status, actions, comments); single column below 1024 px.
- **Tablet (768–1023 px):** nav tabs scroll horizontally; filters collapse into a "Filters (3)" drawer; tables scroll horizontally inside their card; detail side panel moves below the main content.
- **Density:** table rows 40 px; compact option 32 px (remembered per user).

## Elevation

```yaml
elevation:
  flat: 'none'                                        # tables, cards on ground
  raised: '0 1px 2px rgba(19,32,41,.08)'              # cards, sticky headers
  overlay: '0 8px 24px rgba(19,32,41,.18)'            # menus, popovers, drawers
  modal: '0 16px 48px rgba(19,32,41,.24)'             # dialogs
```

Most surfaces are flat with a `rule` border; shadows are reserved for things that float.

## Components (visual)

Behaviour lives in `EXPERIENCE.md §Component patterns`.

| Component | Visual spec |
|---|---|
| Nav tab | `body` 13.5px, `ink-2`; selected = `ink`, weight 600, 3px `accent` underline; badge = `label` on `grey-soft` pill, `amber-soft` when it counts items needing action |
| Button primary | `accent` fill, white text (dark: `ground` text), radius `sm`, 36px height |
| Button secondary | `paper` fill, `rule` border, `ink` text |
| Button danger | `paper` fill, `red` border and text; used for Reject, Cancel, Decline |
| Status pill | `label` type, fill + text tokens from the status map, icon 12px, radius `sm` |
| KPI tile | `paper` card; `label` title; `kpi-value` number; `small` definition; whole tile is a link (focus ring on the card) |
| Table | Header `label` on `ground`; rows `body`; amounts `amount`; IDs `id`; row hover `ground`; selected row 3px `accent` left border |
| Filter chip | `paper`, `rule` border, radius `pill`; active = `accent-soft` fill, `accent` text, × to remove |
| Stepper (Request) | Route-line motif: 4 stops on a 2px line; done = `accent` filled, current = `accent` ring, upcoming = `ink-3` ring |
| Reason modal | Radio list of reasons + textarea for *Other*; danger button disabled until valid |
| Comment | Author `body-strong`, company `small ink-2`, time `small ink-3`; own company's comments on `accent-soft` |
| History entry | Timeline row: time `id`, actor `body-strong`, change `body` with before → after in `mono` |
| Toast | `ink` fill, `ground` text, bottom-left, 6 s, action link in `accent` (dark: `accent`) |
| Banner | Full-width inside the page; info `blue-soft`, warning `amber-soft`, error `red-soft`; left border 3px |
| Focus ring | 2px `accent` outline, 2px offset, on every interactive element |

## Do's and don'ts

| Do | Don't |
|---|---|
| Pair every status colour with its label and icon | Colour-only status or colour-only row highlighting |
| Use the six status names exactly as in the BRD | "Pending", "Live", "Archived", "Taken" or other synonyms for trip status |
| Right-align amounts with tabular figures and currency | Mixed alignment or proportional digits in amount columns |
| Keep IDs in mono | Truncate Trip IDs or invoice numbers |
| Show why a list is empty and offer Clear filters | "No data" |
| Put destructive actions (Reject, Cancel, Decline) behind a reason modal | One-click destructive buttons |
| Respect reduced motion | Animate row moves or KPI counters |
| Test every token pair in both light and dark | Ship a colour only defined in one theme |

## Open markers

- `[TEQ]` TEQ's own design system and component library may replace these components; tokens then map to TEQ equivalents.
- `[ASSUMPTION]` Dark theme follows the user's TEQ/OS preference; it is not a BRD requirement and may be deferred if TEQ has no dark mode.
