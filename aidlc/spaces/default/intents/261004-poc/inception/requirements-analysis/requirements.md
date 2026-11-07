# Requirements — BusNetwork Portal Proof-of-Concept

Upstream: `ideation/intent-capture/intent-statement.md` (approved). Answers: `requirements-analysis-questions.md` (Q1–Q8, confirmed). Business rule references (BR-nn, BN-xxx-nn) point to `_bmad-output/planning-artifacts/brd/busnetwork-brd-v1/BRD.md`.

## Intent Analysis

The POC checks the finalized BusNetwork BRD before release 1 is built (intent-statement: Initiative Trigger). It must show four things to host-side users (Sales / Dispatcher) and partner-side users (Partner Coordinator) (intent-statement: Problem Statement, Target Customer):

| Goal | Intent source | Covered by |
|------|---------------|------------|
| G1. A trip's single status alone decides its tab | Problem Statement, bullet 1 | FR3, FR6 |
| G2. A host shares a trip; partners accept or reject | Problem Statement, bullet 2 | FR2, FR4 |
| G3. A closed trip becomes an invoice that is approved or declined | Problem Statement, bullet 3 | FR5 |
| G4. A dashboard shows what needs action now | Problem Statement, bullet 4 | FR7 |

The POC is throwaway: a standalone web app, run locally, with seeded data and no connection to TEQ (Q3). Every goal now has its own pass/fail criterion (below), not only the click-through demo.

**Glossary.** *Host*: the company that owns a trip and shares it. *Partner*: a company a trip is shared with. *Status*: one of six trip states: Requested, Accepted, In progress (open), and Completed, Cancelled, Rejected (closed). *Active / Closed / All*: the three trip lists. *Demo time*: the app's adjustable "current time".

## Functional Requirements

### FR1. Demo companies and switching

- **FR1.1** The app is seeded with one host company and three partner companies (Q7, Q8). *Pass:* on first start, the company switcher lists exactly four companies, one of them marked as host.
- **FR1.2** A switcher changes the current company without a sign-in step (Q7). *Pass:* choosing a company reloads every list, the dashboard, and the invoices for that company.
- **FR1.3** Each company sees only trips it hosts or was offered, and only invoices it sent or received (Q7, BR-04). *Pass:* a trip shared with partners P1 and P2 is not visible to partner P3. An invoice between the host and P1 is not visible to P2 or P3.

### FR2. Create and share a trip (host)

- **FR2.1** The host creates a trip with: customer name, from, to, planned start, planned end, customer price (Q4). *Pass:* submitting with any field empty, or with end not after start, is refused with a message naming the field.
- **FR2.2** The host selects one or more partners and sees an offer price per partner that can be edited before submitting (Q4). *Pass:* changing one partner's offer price leaves the others unchanged, and the saved trip keeps each partner's price.
- **FR2.3** Submitting sets the trip to **Requested** and sends an offer to each selected partner. *Pass:* the new trip appears in the host's Active list as Requested, and in each selected partner's Active list with its own offer price.

### FR3. Trip lifecycle

The only allowed status changes are listed below. Any other change is refused (BRD §7, Q2, Q5).

| ID | From | Event | To | Who |
|----|------|-------|----|-----|
| FR3.1 | Requested | A partner accepts its offer | Accepted | Partner |
| FR3.2 | Requested | Every offered partner has rejected | Rejected | Partner (last reject) |
| FR3.3 | Requested or Accepted | Host or partner cancels with a reason | Cancelled | Host / accepting partner |
| FR3.4 | Accepted | Demo time reaches planned start | In progress | System |
| FR3.5 | In progress | Demo time reaches planned end, or the partner marks it complete | Completed | System / partner |

- **FR3.6** First to accept wins (Q1, BR-03). When a partner accepts, all other open offers for that trip are withdrawn. *Pass:* with a trip offered to P1, P2 and P3, P2 accepts. The trip is Accepted with P2, and P1 and P3 can no longer accept or reject it.
- **FR3.7** Cancel requires a non-empty reason (Q5). *Pass:* cancel with an empty reason is refused, and the trip status does not change.
- **FR3.8** Completed, Cancelled and Rejected are final. *Pass:* no action that changes status is offered on a closed trip.

### FR4. Partner response

- **FR4.1** A partner sees each offer made to it with the trip details and its own offer price, and can accept or reject it (Q4). *Pass:* the accept and reject actions are shown only while the trip is Requested and the offer is still open.
- **FR4.2** A partner never sees the customer price or other partners' offers (BR-04). *Pass:* the partner's trip view shows only its own offer price.

### FR5. Invoice a completed trip

- **FR5.1** The accepting partner can create an invoice only for a Completed trip, and at most one invoice per trip that is not Declined (intent-statement: Target Customer; BN-INV-03). *Pass:* "Create invoice" is absent on any trip that isn't Completed, and absent again once a non-declined invoice exists.
- **FR5.2** A new invoice starts with one line for the agreed offer price. The partner can add extra lines with description, quantity, unit price and VAT rate (Q4). *Pass:* the invoice shows, per line, quantity × unit price and its VAT. Totals excl. VAT, VAT and total equal the sum of the lines, rounded to 2 decimals.
- **FR5.3** Invoice statuses are Draft, Pending, Approved and Declined (Q4, BRD §9.6). The partner edits a Draft and submits it, which makes it Pending. The host approves or declines a Pending invoice. *Pass:* each action is offered only to the company and in the status listed here.
- **FR5.4** Declining requires a reason. The partner can then edit the invoice and submit it again (BN-INV-06, BRD §9.6). *Pass:* decline with an empty reason is refused. After a decline, the partner can edit and resubmit, and the invoice returns to Pending.
- **FR5.5** Approving locks the amounts (BN-INV-06). *Pass:* an Approved invoice offers no edit action, and its totals don't change if the trip's offer price changes later.

### FR6. Trip lists and the tab-placement check

- **FR6.1** Active lists trips in Requested, Accepted or In progress. Closed lists Completed, Cancelled or Rejected. All lists every trip (BR-01, intent-statement: Success Metrics). The list is chosen only from the trip's status.
- **FR6.2** An automated check runs over every seeded and created trip, for every company. *Pass:* each trip appears in exactly one of Active or Closed and always in All. The check covers trips in all six statuses (intent-statement: Success Metrics, Q5).
- **FR6.3** Seed data includes trips that reach all six statuses through the flows in FR3, or a scripted demo path that produces them (Q5). *Pass:* after the scripted path runs, at least one trip exists in each of the six statuses.

### FR7. Dashboard

- **FR7.1** Key figures for the current company (Q6, BN-DSH-01):
  - awaiting response: for the host, its Requested trips; for a partner, open offers waiting for its answer;
  - active trips: count of its Active list;
  - open invoices: the total of Pending invoices it sent (partner) or must approve (host).

  *Pass:* each figure equals the count or sum computed directly from the lists.
- **FR7.2** A "Needs your action" list for the current company (Q6, BN-DSH-04):
  - for a partner, offers waiting for its response and Declined invoices to fix;
  - for the host, Pending invoices to approve;
  - for both, trips cancelled by the other side since the last view.

  *Pass:* each item opens the matching trip or invoice. Acting on it (accept, reject, approve, decline, resubmit) removes it from the list.
- **FR7.3** The dashboard reflects every change right away. *Pass:* after a partner accepts, the host's "awaiting response" figure for that trip updates on the next page load without restarting the app.

### FR8. Demo time control

- **FR8.1** A control shows the current demo time and moves it forward (Q2). *Pass:* moving demo time past a trip's planned start turns Accepted into In progress. Moving it past the planned end turns In progress into Completed (FR3.4, FR3.5).
- **FR8.2** Demo time never moves backward, and a reset restores the seed data. *Pass:* after a reset, the trips, invoices and demo time equal the initial seed.

## Non-Functional Requirements

- **NFR1 Company isolation:** the app shows each company only its own data (FR1.3) (Q7, BR-04). *Pass:* the FR1.3 checks pass for every pair of companies.
- **NFR2 Runs locally:** the app starts with one documented command on a developer machine, with no external services or credentials (Q3). *Pass:* a fresh checkout runs with the documented command and shows the dashboard.
- **NFR3 Repeatable check:** the tab-placement check (FR6.2) and the lifecycle rules (FR3) run as automated tests (intent-statement: Success Metrics). *Pass:* the test command exits 0 on the seeded data.

No performance, availability, localisation, accessibility or security targets apply to this POC (Q7).

## Constraints

- A standalone web app with seeded sample data, run locally, with no TEQ connection (Q3).
- The scope is a throwaway proof with minimal process (intent-statement: Initial Scope Signal).
- No real sign-in: switching companies stands in for users (Q7).

## Assumptions

| ID | Assumption | Why |
|----|------------|-----|
| A1 | The default offer price for each partner is the customer price × the partner's seeded percentage rate, rounded to 2 decimals | Q4 wants an editable price per partner; the percentage agreement is the BRD's main formula (BRD §9.2) |
| A2 | Amounts are in NOK with 2-decimal standard rounding. The offer-price invoice line defaults to a 25 % VAT rate, editable in Draft | BR-08 and NOK default (BRD §9.6); the POC has no company VAT settings |
| A3 | "Mark complete" (FR3.5) is available to the accepting partner only while the trip is In progress | BRD §7 names the partner as the manual trigger; BRD question Q5 (automatic vs. confirmed) stays open, and the POC supports both |
| A4 | Seeded trips begin as Requested or later, created through the same rules as real ones | Keeps FR6.2 meaningful instead of checking hand-set statuses |

## Out of Scope

- Response deadlines and expiry (Q5).
- Price changes after acceptance (BR-05), drafts of requests, quick share, attachments, via stops, and fixed-trip shifts (Q4).
- Invoice archive, filters, PDF and totals footer (Q4).
- Charts, upcoming-trips panel, and period selector on the dashboard (Q6).
- Sign-in, roles, departments, localisation, accessibility beyond defaults, audit log, notifications, and any TEQ integration (Q3, Q7).

## Open Questions

- The POC follows first-to-accept-wins (Q1). BRD question Q4 (host chooses instead) stays open, and the POC result can inform it.
- BRD questions Q1–Q3 and Q5–Q7 are not settled by this POC. A3 notes how Q5 is handled for the demo.
