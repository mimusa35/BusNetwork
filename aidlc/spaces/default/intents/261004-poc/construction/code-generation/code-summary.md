# Code Summary — BusNetwork Portal POC

## Files Created

All files are under `poc/` at the workspace root. Nothing existed before, so nothing was modified.

| Area | Files |
|------|-------|
| Project and config | `package.json` (scripts `start`, `test`, `typecheck`), `package-lock.json`, `tsconfig.json` (strict), `vitest.config.ts`, `.gitignore`, `README.md` |
| Data model | `src/domain/types.ts` (Company, Trip, Offer, the 6 trip statuses, Invoice, InvoiceLine, the 4 invoice statuses, HistoryEntry, DomainError), `src/domain/money.ts` (2-decimal rounding, line and invoice totals, 25 % default VAT) |
| Data access | `src/domain/store.ts` (in-memory store, deterministic IDs, reset that reruns the seed), `src/domain/clock.ts` (demo time, forward only, UTC) |
| Business logic | `src/domain/trips.ts` (allowed-transition table, create/share, accept with first-to-accept, reject, cancel, mark complete, `advanceTime`), `src/domain/views.ts` (visibility, Active/Closed/All, partner-safe view), `src/domain/invoices.ts`, `src/domain/dashboard.ts`, `src/domain/tabCheck.ts`, `src/seed.ts` |
| Web layer | `src/web/app.ts` (Express app, company switcher cookie, input validation, error handling), `src/web/views.ts` (server-rendered pages with `data-testid`), `src/web/html.ts` (escaping template), `src/server.ts` (entry point, `PORT` default 3000) |
| Tests | `test/helpers.ts`, `test/domain/{money,store-clock,trips,views,invoices,dashboard,seed-tabcheck}.test.ts`, `test/web/app.test.ts` |

## Key Implementation Decisions

- The stack follows the approved plan: TypeScript, Express 4 with server-rendered HTML, an in-memory store, Vitest and supertest. npm installed the current majors, TypeScript 7 and Vitest 5. Express is pinned to 4.
- Decisions D1–D7 from the plan are implemented as written:
  - D1: partners who lose or reject a trip no longer see it.
  - D2: times are forward only and transitions are applied in order.
  - D3: cancellation items clear when the trip is opened, and there is a "create invoice" item.
  - D4: invoices are resubmitted in place, one per trip.
  - D5: prices are excl. VAT, and the open-invoices figure shows count and total incl. VAT.
  - D6: cancel rights depend on role.
  - D7: totals are frozen on approval.
- The seed starts the demo clock at 2026-10-01 08:00 UTC. It runs the real trip and invoice actions up to the demo start, 2026-10-05 08:00 UTC. The result is 12 trips across all six statuses, and invoices in Draft, Pending, Approved and Declined.
- Partners never see the customer price or other partners' offers. In a partner's trip history, other partners are anonymised.
- A blank offer price on the new-trip form uses the agreement default: customer price × the partner's rate (assumption A1).
- Error handling:
  - business-rule errors are shown to the user with HTTP 400, or 404 for records the company cannot see;
  - oversized form bodies get 413;
  - unexpected errors are logged and answered with 500, without details;
  - the server exits with a logged message on a bad `PORT` or a port that is already in use.
- There is no sign-in, by design: the company switcher stands in for users. The README and `src/web/app.ts` both warn about this.

## Test Coverage Summary

| Command | Result |
|---------|--------|
| `cd poc && npx vitest run` (all 8 test files) | 44 / 44 passed |
| `cd poc && npm run typecheck` | exit 0 |
| `PORT=3999 npm start` + GET `/`, `/tab-check` | dashboard served, tab check 200 |

Every functional and non-functional requirement (FR1.1–FR8.2, NFR1–NFR3) maps to an implementing file and at least one test. See `traceability.json`. The tab-placement check passes for every company on the seeded data. A deliberately broken trip is reported as a violation. No coverage threshold applies to the poc scope, so none is configured.

## Deviations from the Plan

- 44 tests instead of the planned ~23. Every planned row is covered; the extra tests are the error and edge cases the construction guardrails require.
- `test/helpers.ts` (a shared fixture) and `src/web/html.ts` (an escaping helper) were added. Both support planned steps.
- During the business-logic step, one test failed: its fixture created a trip with a start time earlier than the already-advanced demo time. The fixture was fixed. The D2 rule was not relaxed.
