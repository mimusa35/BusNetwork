# Integration Test Instructions — BusNetwork Portal POC

The active test strategy is Minimal, so no separate integration suite is generated. The POC still has one cross-layer test file, from Code Generation (`construction/code-generation/unit-test-instructions.md`). It drives the real Express app over HTTP with supertest. This file records how to run it.

## Test Framework Setup

- Vitest with supertest, configured in `poc/vitest.config.ts`.
- The app factory is built with a fresh in-memory store for each test, so no port and no shared state are needed.

## How to Run

```bash
cd poc && npx vitest run test/web/app.test.ts
```

## What It Covers

| Test | Boundary exercised |
|------|--------------------|
| Switching company changes the lists | Cookie switcher → views → domain visibility (FR1.2, FR1.3) |
| A form error returns 400 and names the field | Form validation → `DomainError` → HTTP error page (FR2.1) |
| Share → accept → advance time → invoice → submit → approve | Full HTTP path across trips, clock and invoices (goals G1–G3) |

## Expected Coverage

Six tests, all passing. The `poc` scope sets no coverage threshold.

## Test Data

Each test uses either the seeded store or the shared fixture in `poc/test/helpers.ts` (one host, three partners).
