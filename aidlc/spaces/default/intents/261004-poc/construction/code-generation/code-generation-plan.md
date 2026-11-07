# Code Generation Plan — BusNetwork Portal POC

Input: `inception/requirements-analysis/requirements.md` (approved; FR1–FR8, NFR1–NFR3, A1–A4). This `poc` workflow has no Units Generation or design stages, so this is one zero-Unit implementation pass. Greenfield: no existing code or tests in the workspace.

## Technical Approach

| Decision | Choice | Why | Alternative considered |
|----------|--------|-----|------------------------|
| Location | New folder `poc/` at the workspace root | Keeps the throwaway app apart from the planning documents | Workspace root itself (mixes with `docs/`, `_bmad-output/`) |
| Language / runtime | TypeScript on Node.js 20+ | One language for logic, server and tests; type-checked | Python + Flask (no shared types with any later TS portal) |
| Web layer | Express serving server-rendered HTML with plain forms, no front-end build | Smallest thing that gives a clickable demo and stays testable; satisfies "one command" (NFR2) | React + Vite SPA (more moving parts than a POC needs) |
| State | In-memory store, rebuilt from a seed script on start and on reset | No external services (NFR2); reset (FR8.2) is trivial | SQLite file (adds a dependency, nothing to prove) |
| Seed | Seed script drives the real domain actions to create trips in all six statuses | Resolves the open seeding choice (FR6.3) and keeps statuses rule-produced (A4) | Hand-written records with preset statuses |
| Tests | Vitest (+ supertest for HTTP) | Fast, TS-native, one small config file | Jest (needs ts-jest/babel setup) |

## Decisions Resolving Open Requirement Points

These close the gaps the requirements review raised. No design stage follows, so they are part of this plan and are approved with it.

- **D1 Visibility of a trip to partners (review R-01).** A partner sees a trip only while its own offer is open, or once it is the accepting partner. When a partner rejects, or its offer is withdrawn (another partner accepted, or the host cancelled while Requested), the trip leaves that partner's lists entirely. The host always sees its trips. The trip keeps one status for everyone who can see it (BR-01). The tab-placement check (FR6.2) runs per company over the trips that company can see.
- **D2 Time rules (review R-02).**
  - Creating a trip requires planned start ≥ current demo time.
  - A partner cannot accept once demo time has reached planned start; the action is refused with a message. The host can still cancel. The trip otherwise stays Requested, because there is no deadline (out of scope).
  - A time jump applies every due change in order: an Accepted trip whose start and end have both passed goes Accepted → In progress → Completed, and both changes appear in its history.
  - The time control offers "+1 hour", "+1 day", and "jump to date/time" (forward only).
- **D3 Needs-your-action items (review R-03).** A "cancelled by the other side" item clears when that company opens the trip. Add an item for the accepting partner: "Completed — create invoice", shown until an invoice exists.
- **D4 Invoice per trip (review R-04).** A Declined invoice is edited and resubmitted in place. While a trip has any invoice, no new invoice can be created for it.
- **D5 Amounts (review R-05).** Offer prices are excl. VAT. The "open invoices" figure shows the count and the sum incl. VAT of Pending invoices.
- **D6 Cancelling (review R-06).** While Requested, only the host can cancel; this withdraws all open offers. While Accepted, the host or the accepting partner can cancel.
- **D7 Locked invoice (review R-07).** FR5.5 is tested as: an Approved invoice offers no edit or submit action, and its stored totals are returned unchanged.

## Code Generation Steps

Ordering follows the Testing Contract below: test-after, so each testable layer is built and then its tests are written and run. The server-rendered pages are the frontend, so the API/endpoint and frontend layers are one web layer here.

- [x] **Step 1 — Project structure and configuration skeleton.** Create `poc/package.json` (scripts `start`, `test`, `typecheck`), `poc/tsconfig.json`, `poc/.gitignore`. Dependencies: `express`; dev: `typescript`, `tsx`, `vitest`, `@types/express`, `@types/node`, `supertest`, `@types/supertest`. Run `npm install` in `poc/`. (NFR2)
- [x] **Step 2 — Test runner bootstrap.** Create `poc/vitest.config.ts` (tests under `poc/test/`). Confirm `npx vitest run --passWithNoTests` exits 0 in `poc/`. The exact commands are recorded in `unit-test-instructions.md`. (NFR3)
- [x] **Step 3 — Data model: implement.** `poc/src/domain/types.ts` (Company, Trip, Offer, TripStatus, Invoice, InvoiceLine, InvoiceStatus, HistoryEntry, DomainError with field and message) and `poc/src/domain/money.ts` (2-decimal standard rounding, line and invoice totals; offer prices excl. VAT). (FR5.2, A1, A2, D5)
- [x] **Step 4 — Data model: write and run tests.** `poc/test/domain/money.test.ts`. Run it.
- [x] **Step 5 — Data access: implement.** `poc/src/domain/store.ts` (in-memory state, ID generation, reset) and `poc/src/domain/clock.ts` (demo time that moves forward only). (FR8, D2)
- [x] **Step 6 — Data access: write and run tests.** `poc/test/domain/store-clock.test.ts`. Run it.
- [x] **Step 7 — Business logic: implement.**
  - `poc/src/domain/trips.ts`: create and share with field validation (FR2); accept with first-to-accept withdrawal (FR3.1, FR3.6); reject, and all-rejected → Rejected (FR3.2); cancel with a reason and role rules (FR3.3, FR3.7, D6); mark complete (FR3.5, A3); apply due time changes in order (FR3.4, FR3.5, D2); refuse any other change and any action on a final status (FR3, FR3.8); history entries.
  - `poc/src/domain/views.ts`: trips visible to a company (FR1.3, FR4.2, D1); Active / Closed / All lists from status alone (FR6.1); partner-safe trip view without customer price or other offers (FR4.2).
  - `poc/src/domain/invoices.ts`: create for a Completed trip by the accepting partner, prefilled offer-price line at 25 % VAT (FR5.1, A2); add and edit lines in Draft or Declined; submit; approve (locks); decline with a reason; resubmit in place (FR5.2–FR5.5, D4, D7).
  - `poc/src/domain/dashboard.ts`: key figures per company (FR7.1, D5) and the Needs-your-action list with its clearing rules (FR7.2, D3).
  - `poc/src/domain/tabCheck.ts`: for every company and every visible trip, exactly one of Active/Closed and presence in All; reports violations (FR6.2).
  - `poc/src/seed.ts`: one host (Nordic Coaches AS) and three partners with percentage rates, then scripted real actions that leave at least one trip in each of the six statuses and invoices in Draft, Pending, Approved and Declined (FR1.1, FR6.3, A4).
- [x] **Step 8 — Business logic: write and run tests.** `poc/test/domain/trips.test.ts`, `views.test.ts`, `invoices.test.ts`, `dashboard.test.ts`, `seed-tabcheck.test.ts`, as listed in `unit-test-instructions.md`. Run them.
- [x] **Step 9 — Web layer: implement.** `poc/src/web/app.ts`: Express app factory; company switcher via cookie; validation of every form input at the boundary; `DomainError` shown to the user with HTTP 400; unexpected errors logged and answered with 500. `poc/src/web/views.ts`: HTML templates with escaped output and `data-testid` on every interactive element. Routes for dashboard, Active / Closed / All, trip detail with actions, new trip form, invoices, demo time control, reset, and the tab-check page. `poc/src/server.ts` starts on `PORT` (default 3000). (FR1.2, FR2–FR8)
- [x] **Step 10 — Web layer: write and run tests.** `poc/test/web/app.test.ts` with supertest: switching company changes the lists; a form error shows the field message; the full path from sharing a trip to an approved invoice works over HTTP. Run it.
- [x] **Step 11 — Environment and build configuration.** `npm run typecheck` (`tsc --noEmit`) passes, and `npm start` serves the dashboard on port 3000. (NFR2)
- [x] **Step 12 — Documentation and traceability.** `poc/README.md`: prerequisites (Node 20+), `npm install`, `npm start`, `npm test`, a demo script saying which company to switch to at each step, and decisions D1–D7.

## Requirement Traceability

| Requirement | Plan step(s) |
|-------------|--------------|
| FR1 Demo companies and switching | 7, 9 |
| FR2 Create and share | 7, 9 |
| FR3 Lifecycle | 7 |
| FR4 Partner response | 7 |
| FR5 Invoicing | 3, 7 |
| FR6 Lists and tab check | 7 |
| FR7 Dashboard | 7 |
| FR8 Demo time | 5, 7, 9 |
| NFR1 Company isolation | 7, 8 |
| NFR2 Runs locally | 1, 11, 12 |
| NFR3 Repeatable check | 2, 8 |

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "poc",
  "test_strategy": "minimal",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "project",
      "text": "- Give every functional requirement its own pass/fail criterion, so later stages don't have to invent acceptance checks. (learned 2026-10-04)"
    }
  ],
  "obligations": {
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:ae0db60890ea8da03a6cc3411ca2e47e475ebe0b2dc2e1c01abaaf3b3c3c6cd2",
  "contract_sha256": "sha256:e6cd820ff7fca0249c4495dc4f42e15a7b2bce0a47f86d351ad90ce40f101720"
}
```
