# BusNetwork portal POC

A throwaway proof-of-concept that checks the BusNetwork BRD
(`docs/planning-artifacts/brd/busnetwork-brd-v1/BRD.md`) with host-side
and partner-side users. It shows four things:

1. A trip's single status alone decides its tab (Active / Closed / All).
2. A host shares a trip; partners accept or reject (first to accept wins).
3. A completed trip becomes an invoice that is approved or declined.
4. A dashboard shows what needs action now.

It is a standalone local web app with seeded sample data, held in memory. It
does not connect to TEQ or any other service.

> **No sign-in, on purpose.** The company switcher at the top of every page
> stands in for users (requirements Q7). The per-company visibility rules are
> applied on every request, but anyone who can open the app can act as any
> company. Do not expose it beyond your own machine.

## Prerequisites

- Node.js 20 or newer (tested with Node 22) and npm.
- No database, credentials or environment variables needed.

## Run it

```bash
cd poc
npm install
npm start            # http://localhost:3000  (set PORT to use another port)
```

Other commands:

```bash
npm test             # all automated tests (lifecycle, tab check, invoices, dashboard, HTTP)
npm run typecheck    # TypeScript type check
```

## Seeded data

Companies: **Nordic Coaches AS** (host) and three partners: **Fjord Bus AS**
(85 % agreement), **Vestland Turbuss AS** (88 %), **Trondelag Charter AS** (82 %).

The seed drives the real actions from 2026-10-01 08:00 UTC to the demo start,
**2026-10-05 08:00 UTC**, so every status is produced by the rules:

| Trip | Route | Status at demo start | Notes |
|------|-------|----------------------|-------|
| trip-1 | Oslo - Lillehammer | Completed | Fjord Bus; invoice inv-1 **Approved** (with an extra toll line) |
| trip-2 | Bergen - Voss | Completed | Vestland Turbuss; invoice inv-2 **Pending** |
| trip-3 | Trondheim - Roros | Completed | Trondelag Charter; invoice inv-3 **Declined** |
| trip-4 | Oslo - Gardermoen | Completed | Fjord Bus; invoice inv-4 **Draft** |
| trip-5 | Stavanger - Preikestolen | Completed | Marked complete by Vestland Turbuss; no invoice yet |
| trip-6 | Oslo - Drammen | In progress | Fjord Bus |
| trip-7 | Bergen - Flam | Cancelled | Host cancelled while Requested |
| trip-8 | Tromso - Alta | Cancelled | Trondelag Charter cancelled after accepting |
| trip-9 | Kristiansand - Arendal | Rejected | Both offered partners rejected |
| trip-10 | Oslo - Hamar | Requested | Open offers to all three partners |
| trip-11 | Bergen - Geilo | Requested | Trondelag Charter rejected; Fjord Bus still open |
| trip-12 | Alesund - Geiranger | Accepted | Vestland Turbuss; starts 2026-10-08 07:00 |

"Reset demo data" in the header restores exactly this state, including demo time.

## Demo script

Use the **Company** switcher in the header at each step.

1. **Nordic Coaches AS (host).** Dashboard: 2 Requested trips awaiting a partner,
   1 Pending invoice to approve, and "Cancelled by the other side" for trip-8.
   Open trip-8 and go back: the item has cleared.
2. **Host → New trip.** Leave a field empty and submit: the form names the field.
   Fill it in (planned start after the current demo time), tick Fjord Bus and
   Vestland Turbuss, change one offer price, leave the other blank (it becomes
   customer price × agreement rate), and share. The trip is in Active as Requested.
3. **Trondelag Charter AS.** The new trip is not in any list (it was not offered).
4. **Vestland Turbuss AS.** Dashboard lists the offer under "Needs your action".
   Open it: you see only your own offer price, never the customer price. Accept.
5. **Fjord Bus AS.** The trip has gone from your lists: Vestland Turbuss accepted
   first and your offer was withdrawn.
6. **Header → demo time.** Jump past the trip's planned end. History shows
   Accepted → In progress → Completed in order.
7. **Vestland Turbuss AS.** The dashboard says "Completed - create invoice". Open
   the trip, create the invoice, add a line (for example a toll), submit it.
8. **Nordic Coaches AS.** Approve or decline (a reason is required) under "Needs
   your action". If declined, switch back to Vestland Turbuss, edit and resubmit:
   it returns to Pending. Once approved, the invoice is locked.
9. **Tab check** (any company): PASS for every company across all six statuses.

## Decisions made for the POC (from the approved code-generation plan)

- **D1 Visibility.** A partner sees a trip only while its own offer is open, or
  once it is the accepting partner. After rejecting, or when its offer is
  withdrawn (another partner accepted, or the host cancelled while Requested),
  the trip leaves that partner's lists. The host always sees its trips. The tab
  check runs per company over the trips that company can see.
- **D2 Time.** A new trip's planned start must be at or after the current demo
  time. A partner cannot accept once demo time has reached the planned start
  (the host can still cancel; there are no deadlines). A time jump applies every
  due change in order. Time controls: +1 hour, +1 day, jump (forward only).
- **D3 Needs your action.** "Cancelled by the other side" clears when that company
  opens the trip. The accepting partner gets "Completed - create invoice" until
  an invoice exists.
- **D4 One invoice per trip.** A Declined invoice is edited and resubmitted in
  place; while a trip has any invoice no new one can be created.
- **D5 Amounts.** Offer prices are excl. VAT. "Open invoices" shows the count and
  the sum incl. VAT of Pending invoices. NOK, 2 decimals, standard rounding;
  the offer-price invoice line defaults to 25 % VAT.
- **D6 Cancelling.** While Requested only the host can cancel (this withdraws all
  open offers). While Accepted the host or the accepting partner can cancel. A
  reason is always required.
- **D7 Locked invoice.** An Approved invoice offers no edit or submit action and
  its stored totals never change.

All times are shown and entered in UTC.

## Layout

```
src/domain/   types, money, store (in-memory), clock, trips (lifecycle),
              views (visibility + lists), invoices, dashboard, tabCheck
src/seed.ts   demo companies and scripted history
src/web/      Express app (routes, form validation) and HTML templates
src/server.ts entry point (PORT, default 3000)
test/         Vitest tests (domain and HTTP via supertest)
```
