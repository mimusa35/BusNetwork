# Unit Test Instructions — BusNetwork Portal POC

## Test Framework Setup

- Runner: Vitest, configured in `poc/vitest.config.ts` (Node environment, tests in `poc/test/**/*.test.ts`).
- HTTP tests: supertest against the Express app factory (no listening port needed).
- Prerequisites: Node.js 20+ and `npm install` run once in `poc/`. No other setup, services or credentials.

## How to Run This Work's Tests

Run from the `poc/` directory. Every command names exact test files.

Runner readiness (Step 2, before the first test exists):

```bash
cd poc && npx vitest run --passWithNoTests
```

Data model (Step 4):

```bash
cd poc && npx vitest run test/domain/money.test.ts
```

Data access (Step 6):

```bash
cd poc && npx vitest run test/domain/store-clock.test.ts
```

Business logic (Step 8):

```bash
cd poc && npx vitest run test/domain/trips.test.ts test/domain/views.test.ts test/domain/invoices.test.ts test/domain/dashboard.test.ts test/domain/seed-tabcheck.test.ts
```

Web layer (Step 10):

```bash
cd poc && npx vitest run test/web/app.test.ts
```

All of this work's tests at once:

```bash
cd poc && npx vitest run test/domain/money.test.ts test/domain/store-clock.test.ts test/domain/trips.test.ts test/domain/views.test.ts test/domain/invoices.test.ts test/domain/dashboard.test.ts test/domain/seed-tabcheck.test.ts test/web/app.test.ts
```

## Planned Tests (Minimal strategy: one per requirement, happy path per component, plus error/edge cases)

| File | Test | Covers |
|------|------|--------|
| money.test.ts | Line and invoice totals round to 2 decimals (excl. VAT, VAT, total) | FR5.2, A2 |
| money.test.ts | Default offer price = customer price × rate, rounded | A1 |
| store-clock.test.ts | Demo time moves forward; moving backward is refused; reset restores initial time | FR8.2, D2 |
| trips.test.ts | Create and share: trip is Requested, each partner has its own offer price | FR2.2, FR2.3 |
| trips.test.ts | Create refused for missing field, end before start, or start before demo time | FR2.1, D2 |
| trips.test.ts | First to accept wins; the other offers are withdrawn and cannot respond | FR3.1, FR3.6 |
| trips.test.ts | All partners reject → Rejected | FR3.2 |
| trips.test.ts | Cancel needs a reason; only the host can cancel while Requested | FR3.3, FR3.7, D6 |
| trips.test.ts | A time jump past start and end goes Accepted → In progress → Completed in order | FR3.4, FR3.5, FR8.1, D2 |
| trips.test.ts | Accept refused after planned start; no action on a final status | D2, FR3.8 |
| views.test.ts | Visibility per company: P3 doesn't see a trip offered to P1 and P2; a withdrawn partner loses it | FR1.3, D1, NFR1 |
| views.test.ts | Partner view hides customer price and other offers | FR4.2 |
| views.test.ts | Active / Closed / All chosen from status alone | FR6.1 |
| invoices.test.ts | Invoice only for a Completed trip by the accepting partner; one invoice per trip | FR5.1, D4 |
| invoices.test.ts | Draft → Pending → Approved locks amounts; no edit afterwards | FR5.3, FR5.5, D7 |
| invoices.test.ts | Decline needs a reason; resubmit in place returns to Pending | FR5.4, D4 |
| dashboard.test.ts | Key figures equal list-derived counts and sums for host and partner | FR7.1, D5 |
| dashboard.test.ts | Needs-your-action items appear and clear after acting or opening | FR7.2, FR7.3, D3 |
| seed-tabcheck.test.ts | Seed has 1 host and 3 partners and trips in all six statuses | FR1.1, FR6.3 |
| seed-tabcheck.test.ts | Tab check passes for every company on seeded data, and reports a violation for a deliberately broken trip | FR6.2, NFR3 |
| app.test.ts | Switching company changes the lists | FR1.2 |
| app.test.ts | A form error returns 400 and names the field | FR2.1 |
| app.test.ts | HTTP path: share → accept → advance time → invoice → submit → approve | G1–G3 end to end |

About 23 tests in total.

## Expected Coverage Targets

The `poc` scope sets no line-coverage floor, and the Minimal strategy asks for one test per requirement. Every FR and NFR above has at least one test. No coverage threshold is configured, so none can be weakened.

## Mocking and Stubbing Guidance

- No mocks for domain logic: tests call the real services on a fresh in-memory store.
- Time is controlled only through the demo clock, never the system clock.
- Web tests use supertest on the app factory with a fresh store per test.

## Test Data Management

- Each test builds a fresh store, using either a small inline fixture (one host, three partners) or the full seed.
- No shared state between tests; reset is exercised explicitly in `store-clock.test.ts`.
