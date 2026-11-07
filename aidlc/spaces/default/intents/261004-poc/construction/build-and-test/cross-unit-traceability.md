# Cross-Unit Traceability — BusNetwork Portal POC

**Verdict: PASS.** Every requirement ID is covered with status `OK`, and every target file exists.

Sources:
- IDs: `inception/requirements-analysis/requirements.md`. User Stories did not run in this `poc` workflow, so there are no AC IDs.
- Coverage: `construction/code-generation/traceability.json`. This is a single stage-level pass with no Units.

## Per-ID Coverage

| ID | Status | Owning stage / Unit | Target file | Exists |
|----|--------|---------------------|-------------|--------|
| FR1.1 | OK | code-generation / stage-level | poc/src/seed.ts | yes |
| FR1.2 | OK | code-generation / stage-level | poc/src/web/app.ts | yes |
| FR1.3 | OK | code-generation / stage-level | poc/src/domain/views.ts | yes |
| FR2.1 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR2.2 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR2.3 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.1 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.2 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.3 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.4 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.5 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.6 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.7 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR3.8 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR4.1 | OK | code-generation / stage-level | poc/src/domain/views.ts | yes |
| FR4.2 | OK | code-generation / stage-level | poc/src/domain/views.ts | yes |
| FR5.1 | OK | code-generation / stage-level | poc/src/domain/invoices.ts | yes |
| FR5.2 | OK | code-generation / stage-level | poc/src/domain/money.ts | yes |
| FR5.3 | OK | code-generation / stage-level | poc/src/domain/invoices.ts | yes |
| FR5.4 | OK | code-generation / stage-level | poc/src/domain/invoices.ts | yes |
| FR5.5 | OK | code-generation / stage-level | poc/src/domain/invoices.ts | yes |
| FR6.1 | OK | code-generation / stage-level | poc/src/domain/views.ts | yes |
| FR6.2 | OK | code-generation / stage-level | poc/src/domain/tabCheck.ts | yes |
| FR6.3 | OK | code-generation / stage-level | poc/src/seed.ts | yes |
| FR7.1 | OK | code-generation / stage-level | poc/src/domain/dashboard.ts | yes |
| FR7.2 | OK | code-generation / stage-level | poc/src/domain/dashboard.ts | yes |
| FR7.3 | OK | code-generation / stage-level | poc/src/domain/dashboard.ts | yes |
| FR8.1 | OK | code-generation / stage-level | poc/src/domain/trips.ts | yes |
| FR8.2 | OK | code-generation / stage-level | poc/src/domain/store.ts | yes |
| NFR1 | OK | code-generation / stage-level | poc/test/domain/views.test.ts | yes |
| NFR2 | OK | code-generation / stage-level | poc/src/server.ts | yes |
| NFR3 | OK | code-generation / stage-level | poc/test/domain/seed-tabcheck.test.ts | yes |

## Group Headings

The requirement group headings FR1–FR8 have no traceability entry of their own. Each one is covered completely through its sub-requirements: FR1 → FR1.1–FR1.3, FR2 → FR2.1–FR2.3, FR3 → FR3.1–FR3.8, FR4 → FR4.1–FR4.2, FR5 → FR5.1–FR5.5, FR6 → FR6.1–FR6.3, FR7 → FR7.1–FR7.3, FR8 → FR8.1–FR8.2.

## Uncovered Elements

None.

## Note

Most targets name the implementing source file rather than the test that exercises it (Code Generation review R-03, accepted). The requirement-to-test mapping is in `construction/code-generation/code-summary.md` and the test table in `unit-test-instructions.md`.
