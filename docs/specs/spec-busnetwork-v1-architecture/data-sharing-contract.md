# Data-sharing contract

*Companion to SPEC.md (BN-SPEC-001). Defines how a network trip relates to its TEQ trip, what each company may see, the canonical values every component uses, and the time/money conventions. Implements BR-01, BR-04, BR-07, BR-08, BR-09, NFR-04, NFR-05 and the BRD §14 data-consistency risk.*

---

## 1. Record linkage — TEQ trip ↔ network trip

| Aspect | Rule | Source |
|---|---|---|
| Identity | The network trip's **Trip ID is the TEQ trip ID** and is the same in both companies' views. | BRD §6 *Trip ID* |
| Links | The network trip stores the source TEQ trip reference; the TEQ trip stores "Shared via BusNetwork" with the Trip ID. Both are written in the same submit. If either can't be written, submit fails. | BN-REQ-09; BRD §14 risk "link records by ID in both directions" |
| Copy point | Trip details are copied from the TEQ trip into the Request form at prefill, then saved to the network trip at submit and at each *Edit* while Requested. | PRD §7.3 |
| Partner quotation | After accept, the partner may create a quotation in its own TEQ account. The quotation links to the Trip ID; its own ID never replaces the Trip ID. | BN-ACT-06 |
| Nightly consistency check | Daily, compare each open network trip with its TEQ trip on: planned start, planned end, return time, from, via stops, to, PAX, trip type, shift/sub-trip times. A difference creates a **consistency flag** (field, both values, checked at). Flags are shown on the trip detail page; **nothing is overwritten automatically**. A flag resolves when values match on a later check. | BRD §14 risk; PRD §6.4, ES-12 |
| Closed trips | Not checked (they can't change — BN-CLS-06). | — |

---

## 2. Visibility by viewing company

"Host" = the company that shared the trip. "Partner" = a company that received a share request for it. Anything not in these tables is not exposed across companies until this contract is amended.

### 2.1 Trip

| Field | Host | Partner (any state) | Notes |
|---|---|---|---|
| Trip ID, type, status (company view), closed reason | ✓ | ✓ | Status per PRD §6.2 |
| Planned start / end / return, trip length | ✓ | ✓ | |
| From, via stops, to, coordinates, map | ✓ | ✓ | |
| Alternative start address | ✓ | ✓ | Set by accepted partner (BN-DTL-02) |
| PAX, vehicle requirements | ✓ | ✓ | |
| Shifts and sub-trips | ✓ | ✓ | |
| Flight no., group ref., sign | ✓ | ✓ | Needed to run the trip (PRD WA-08) |
| Customer contact person name and phone | ✓ | ✓ | Needed to run the trip (PRD WA-08, PQ-15) |
| Customer (company) name, billing details | ✓ | — | BR-04 |
| **Customer price** | ✓ | **—** | BR-04 |
| Comment to partner, comment to driver, invoice reference | ✓ | ✓ | |
| HQ comment, invoice comment | ✓ | — | Host-internal (PRD WA-08) |
| Attachments | ✓ | ✓ | |
| Response deadline | ✓ | ✓ (own request) | |
| Host company name | ✓ | ✓ | |
| Partner companies on the request | All | Own company only | Partners never learn who else was asked or who accepted instead of them |
| Consistency flags | ✓ | Only for fields visible to the partner | |

### 2.2 Share request (per partner)

| Field | Host | That partner | Other partners |
|---|---|---|---|
| Agreement type and rate | ✓ | ✓ | — |
| Calculated offer price, offer price, override marker | ✓ | ✓ (offer price; override marker shown as "adjusted") | — |
| Overridden by (user name) | ✓ | — | — |
| Additional costs | ✓ | ✓ | — |
| State, responded by/at, reason | ✓ | ✓ | — |

### 2.3 Comments and history

| Item | Host | Partner |
|---|---|---|
| Comment thread | All threads (one per partner that commented) | Its own thread with the host only |
| History entries about the trip (status, schedule, route, PAX edits) | ✓ | ✓ |
| History entries about another partner's request or price | ✓ | — |
| History entries about the customer price | ✓ | — |

### 2.4 Invoices

| Field | Issuer (partner) | Recipient (host) |
|---|---|---|
| Invoice no., version, trip, lines, VAT, totals, status, dates, decline reason | ✓ | ✓ |
| Customer column | — | ✓ (BR-04) |
| Internal notes | none in R1 | none in R1 |

### 2.5 Department scope (BR-09)

A user sees a trip or invoice only if it belongs to their company **and** to one of their departments. Host side: the department of the originating TEQ trip. Partner side: the receiving department configured for that affiliation in BusNetwork Settings; if none, only users with all-department scope (PRD WA-27). Out-of-scope items behave as "not found".

---

## 3. Canonical values

Used unchanged by API, storage, analytics, exports and the prototype. Labels are localised; codes are not.

### 3.1 Trip status (BRD §7)

| Code | Label (en_US) | List |
|---|---|---|
| `REQUESTED` | Requested | Active |
| `ACCEPTED` | Accepted | Active |
| `IN_PROGRESS` | In progress | Active |
| `COMPLETED` | Completed | Closed |
| `CANCELLED` | Cancelled | Closed |
| `REJECTED` | Rejected | Closed |

`ACTIVE_SET = {REQUESTED, ACCEPTED, IN_PROGRESS}`; `CLOSED_SET = {COMPLETED, CANCELLED, REJECTED}`. These two sets are defined **once** and imported everywhere (BN-ALL-03).

### 3.2 Share request state (PRD §6.1)

`PENDING` · `ACCEPTED` · `REJECTED` · `WITHDRAWN` · `EXPIRED`. Withdrawal sub-reason: `OTHER_PARTNER_ACCEPTED` · `HOST_CANCELLED` · `REMOVED_BY_HOST`.

### 3.3 Invoice status (BRD §9.6)

`DRAFT` · `PENDING` · `APPROVED` · `DECLINED`.

### 3.4 Other enumerations

| Name | Values |
|---|---|
| Trip type | `NORMAL` · `FIXED` |
| Price agreement | `PERCENTAGE` · `FULL_DAY` · `HALF_DAY` · `NONE` |
| Direction | `SHARED` (company is host) · `RECEIVED` (company is partner) |
| Reason kind | `REJECT` · `CANCEL` · `INVOICE_DECLINE` (codes per company catalogue, PRD WA-07) |
| Notification event | `N01_REQUEST_RECEIVED` … `N08_INVOICE_DECIDED` (PRD §7.9) |
| Invoice line source | `OFFER_PRICE` · `ADDITIONAL_COST` · `EXTRA` |

---

## 4. Time and money conventions

| Concern | Rule | Source |
|---|---|---|
| Storage time | UTC, ISO 8601 with `Z`. | BR-07, BN-LST-07 |
| Display time | User's TEQ profile time zone; `YYYY-MM-DD HH:MM`; trip length `Xh Ym`. | BN-LST-07 |
| Day filters | From = 00:00:00, To = 23:59:59 **in the user's time zone**, converted to a UTC range once, in one shared utility. | BN-LST-03, BR-07 |
| Currency | Host company's currency for trip prices and invoices. | BR-08 (PRD WA-17) |
| Amount storage | Integer minor units + ISO 4217 currency code. | PRD DR-16 |
| Rounding | Standard rounding, half away from zero, to 2 decimals, in one shared function used by pricing and invoices. | BR-08, BRD §9.2 |
| Percentage | `offer = round(customer_price × rate ÷ 100)` | BRD §9.2 |
| Invoice lines | `net = round(qty × unit_price)`; `vat = round(net × vat_rate ÷ 100)`; totals = sums of rounded line values. | PRD DR-17 |
| Number display | Locale formatting per NFR-06 (e.g. `17 000,00 NOK` in nb_NO). | NFR-06 |

---

## 5. History and audit entry

Every state-changing operation writes one entry **in the same transaction** as the change (NFR-04). Entries are immutable and kept 5 years.

| Field | Content |
|---|---|
| `id` | Unique |
| `entity` | `TRIP` · `SHARE_REQUEST` · `INVOICE` · `COMMENT` · `ATTACHMENT` · `EXPORT` |
| `entity_id` | Trip ID / request ID / invoice no.+version / … |
| `trip_id` | Always set when the entity belongs to a trip |
| `action` | e.g. `STATUS_CHANGED`, `PRICE_OVERRIDDEN`, `PRICE_CHANGE_PROPOSED`, `PRICE_CHANGE_CONFIRMED`, `FIELD_EDITED`, `INVOICE_APPROVED`, `INVOICE_DECLINED`, `LIST_EXPORTED` |
| `actor_user_id` | User, or null with `actor_type = SYSTEM` |
| `actor_company_id` | Company acting (null for System) |
| `at` | UTC |
| `before` / `after` | Changed values only |
| `reason_code` / `reason_text` | When the action carries a reason |
| `visible_to` | `BOTH` · `HOST_ONLY` · `PARTNER:<companyId>` — computed from §2 at write time |
