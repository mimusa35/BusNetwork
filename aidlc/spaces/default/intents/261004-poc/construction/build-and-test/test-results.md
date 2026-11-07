# Test Results — BusNetwork Portal POC

Run on 2026-10-04 in `poc/` (Node 22.23.1, npm 10.9.8). Inputs: `construction/code-generation/unit-test-instructions.md` (commands), `construction/code-generation/code-summary.md` (files), `construction/code-generation/code-generation-plan.md` (Testing Contract).

## Build Status

| Step | Command | Result |
|------|---------|--------|
| Clean install | `npm ci` | Success (exit 0) |
| Type check | `npm run typecheck` | Success (exit 0, no errors) |
| Start | `PORT=3917 npm start` | Success: `GET /` → 200 (dashboard), `GET /tab-check` → 200, reporting "PASS: every trip each company can see is in exactly one of Active or Closed, and always in All" |

## Unit Test Commands

Every distinct command from the unit test instructions was run once.

| Command | Exit | Tests |
|---------|------|-------|
| `npx vitest run --passWithNoTests` | 0 | 44 passed / 44 (runs the whole suite now that tests exist) |
| `npx vitest run test/domain/money.test.ts` | 0 | 6 passed / 6 |
| `npx vitest run test/domain/store-clock.test.ts` | 0 | 6 passed / 6 |
| `npx vitest run test/domain/trips.test.ts test/domain/views.test.ts test/domain/invoices.test.ts test/domain/dashboard.test.ts test/domain/seed-tabcheck.test.ts` | 0 | 26 passed / 26 |
| `npx vitest run test/web/app.test.ts` | 0 | 6 passed / 6 |
| All 8 test files at once | 0 | 44 passed / 44 |

**Total, without double counting:** 44 tests in 8 files. 44 passed, 0 failed, 0 skipped.

## Security Checks

| Check | Result |
|-------|--------|
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm audit` | 0 vulnerabilities |
| Company isolation and input validation tests | Passed (inside the 44 above) |
| Listening address | Confirmed: binds all interfaces (`*:3917`), as the Code Generation review said (R-01, accepted) |

## Failure Details

None.

## Coverage Report

Not collected. The `poc` scope sets no line-coverage floor, and no coverage threshold is configured, so none was weakened. Requirement coverage is checked in `cross-unit-traceability.md`.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|-----------|--------|----------|--------|----------|--------------|---------|
| TC-STRAT-1 | code-generation-plan.md, Testing Contract `obligations.strategy_volume[0]` | One verifiable test per requirement | Every FR1.1–FR8.2 and NFR1–NFR3 maps to at least one passing test | Developer requirement→test map in code-summary.md; unit-test-instructions.md test table; 44/44 pass | build-and-test | Met |
| TC-STRAT-2 | Testing Contract `strategy_volume[1]` | At least one happy-path unit test per component | Happy-path tests in all 8 test files (money, store/clock, trips, views, invoices, dashboard, seed/tab check, web) | Test files under `poc/test/`; 44/44 pass | build-and-test | Met |
| TC-FLOOR-1 | Testing Contract `scope_floor[0]` | Existing test suite stays green | Greenfield; the whole suite is green | All-files command, exit 0 | build-and-test | Met |
| NFR1 | requirements.md NFR1 | FR1.3 isolation checks pass for every pair of companies | Passed | `test/domain/views.test.ts`, `test/domain/invoices.test.ts`, `test/web/app.test.ts` | build-and-test | Met |
| NFR2 | requirements.md NFR2 | Starts with one documented command, no external services | `npm start` served the dashboard (200) | Start check above; `build-instructions.md` | build-and-test | Met |
| NFR3 | requirements.md NFR3 | Test command exits 0 on the seeded data | Exit 0, 44/44 | All-files command | build-and-test | Met |
| FR6.2 | requirements.md FR6.2 | Tab-placement check passes for every company over all six statuses | PASS on seeded data; a deliberately broken trip is reported as a violation | `test/domain/seed-tabcheck.test.ts`; `GET /tab-check` | build-and-test | Met |
| BUILD-TC | build-and-test stage (type-check) | `tsc --noEmit` exits 0 | Exit 0 | `npm run typecheck` | build-and-test | Met |

No target is Not Met, Unverified or Pending.
