# QA Audit — Inventory, Strategy and Baseline

Status: **Phase 1–2 done, Phase 3 started (preliminary probes).** Audit-only: no application code, configuration or dependency was changed.
Date: 2026-10-28. Target: `poc/` (the only executable code in the workspace).

## 1. What was audited

| Area | Exists? | Audited in this pass |
|---|---|---|
| R1 production code, TEQ integration, DB, API | **No.** None is in the workspace (Architecture AR-00, Spine "Stack: UNKNOWN") | Cannot be tested. R1 requirements can only be checked against documents |
| POC `poc/` (TypeScript, Express, Vitest, in-memory) | Yes: about 2 030 lines of source and 870 lines of tests | Yes: full code read, baseline suite, typecheck, probes, server smoke start |
| UX prototype `docs/planning-artifacts/ux-designs/.../prototype/` (plain JS) | Yes | Not yet |
| Planning docs (BRD, PRD, SPEC, contract, Spine) | Yes | Used as the oracle for intended behaviour |

Precedence of truth: **BRD › PRD › SPEC › Architecture › UX › POC**. POC requirements FR1–FR8 and decisions D1–D7 come from `aidlc/spaces/default/intents/261004-poc/`.

## 2. Project inventory (POC)

- **Modules:** `domain/trips.ts` (only status writer, `ALLOWED_TRANSITIONS`), `views.ts` (visibility, lists, company-safe trip view), `invoices.ts`, `dashboard.ts`, `tabCheck.ts`, `money.ts`, `clock.ts`, `store.ts`; `web/app.ts` (routes, form parsing), `web/views.ts` (HTML), `seed.ts`, `server.ts`.
- **Roles:** fixed per company: 1 host (Nordic Coaches AS), 3 partners. No users or sign-in (by design, Q7); a cookie selects the company, and a missing cookie means the host.
- **Journeys:** share trip → partner accept/reject → time advance → In progress → Completed → invoice Draft → Pending → Approved/Declined → resubmit; host/partner cancel; dashboard action items; tab check; reset.
- **Routes:** `GET /`, `/trips/{active,closed,all}`, `/trips/new`, `/trips/:id`, `/invoices`, `/invoices/:id`, `/tab-check`; `POST /switch`, `/time`, `/reset`, `/trips`, `/trips/:id/{accept,reject,cancel,complete,invoice}`, `/invoices/:id/{lines,lines/:lineId,lines/:lineId/delete,submit,approve,decline}`.
- **Entities:** Company, Trip (+ Offer[], HistoryEntry[]), Invoice (+ InvoiceLine[], approvedTotals).
- **Critical rules:** one status decides the tab (BR-01); first accept wins (BR-03); partner field visibility (BR-04, contract §2); closed statuses final; invoice only for Completed, one per trip (D4); approve locks amounts (D7); money rounded half-away-from-zero.
- **Existing tests:** 44 tests in 8 files; domain unit tests and supertest HTTP tests. No browser, accessibility, performance or coverage tooling.

## 3. Requirement traceability (preview)

| Req | Implementation | Existing test | Status |
|---|---|---|---|
| FR1.1–1.3, NFR1 | seed.ts, views.ts `canSeeTrip`/`canSeeInvoice` | views, invoices, app tests | Implemented; but see BUG-03 (customer name, BR-04) |
| FR2.1–2.3 | trips.ts `createTrip`, app.ts `POST /trips` | trips, app | Implemented; BUG-05 (hint ≠ saved) |
| FR3.1–3.8 | trips.ts | trips | Implemented; BUG-01/02 (accept after start) |
| FR4.1 | views.ts `tripActions` | trips | **Partial**: Accept is offered when it can only fail (BUG-01) |
| FR4.2 | views.ts `tripViewFor` | views | Implemented for price and other offers; probe PR-11 found no leak |
| FR5.1–5.5 | invoices.ts | invoices, app | Implemented; SUS-01 (offer line editable), BUG-06 (VAT precision) |
| FR6.1–6.3, NFR3 | views.ts, tabCheck.ts | seed-tabcheck | Implemented; 3 000-step random walk kept the check green |
| FR7.1–7.3 | dashboard.ts | dashboard | **Partial**: stale "Respond to offer" item (BUG-01) |
| FR8.1–8.2 | clock.ts, trips.ts `advanceTime` | store-clock, trips, app | Implemented |
| NFR2 | server.ts | none (manual) | Verified: server started, `/` 200, tab check PASS |
| R1 BN-*/FR-001..110 | none | none | **Cannot be verified**: no R1 code |

## 4. Test strategy

Risk order: (1) cross-company visibility, (2) lifecycle and first-accept, (3) money and invoice lock, (4) time handling, (5) dashboard/list consistency, (6) web boundary (validation, status codes, CSRF, XSS), (7) UI/accessibility/prototype.

| Category | Approach | Status |
|---|---|---|
| Functional, lifecycle, negative, boundary | Domain probes with injected demo time; extend Vitest suite once fixes are approved | Started |
| Integration/API/E2E | supertest against `createApp` (existing convention) | Started |
| Visibility/authZ | For every company × visible trip, check the payload for forbidden fields and other partners' names | Started (PR-05, PR-11) |
| Data integrity / state | Seeded random walk over all actions + tab check + history chain check | Done (PR-14, pass) |
| Concurrency | Node.js is single-threaded and the store is synchronous, so races are impossible within one process; R1 AR-03 cannot be tested | N/A for POC |
| Security | XSS escaping review, open redirect, CSRF, body limit, error leakage | Started |
| Performance/load | Not a POC target (requirements NFR section) | Not planned |
| Accessibility, cross-browser, responsive | No framework in repo; needs approval to add Playwright/axe | Blocked: needs a dependency decision |
| Coverage | `@vitest/coverage-v8` not installed | Blocked: needs a dependency decision |
| Prototype | Static review against the spec, plus the in-browser walk if a browser is available | Not started |

## 5. Baseline (before any fix)

| Command (in `poc/`) | Result |
|---|---|
| `npm test` | 8 files, **44 passed**, 0 failed |
| `npm run typecheck` | Exit 0, no errors |
| `PORT=3917 npx tsx src/server.ts` + `curl /`, `/tab-check` | 200; `data-passed="true"` |
| Probe script (scratchpad, 14 probes) | 12 reproduced, 2 found no defect |

## 6. Preliminary findings

All confirmed findings were reproduced with the probe script. Severity is judged for a throwaway POC; each item notes whether the same flaw would matter in R1.

| ID | Sev | Conf | Title | Evidence |
|---|---|---|---|---|
| BUG-01 | MEDIUM | CONFIRMED | Accept, Reject and the "Respond to offer" item are still offered after planned start, but Accept is always refused (D2); the trip stays Requested in Active indefinitely and counts in both dashboards | PR-01: actions `[accept,reject]`, item `respond-offer`, accept → `invalid_state`; status still Requested 30 days later. Cause: `views.ts:63` and `dashboard.ts` check status + offer only, not `now < plannedStart` like `trips.ts` `acceptOffer` |
| BUG-02 | LOW | CONFIRMED | A trip with planned start = now is accepted at create but can never be accepted by a partner | PR-02. Inclusive check `trips.ts` `createTrip` (`plannedStart < now` refused) vs exclusive check in `acceptOffer` (`now >= plannedStart` refused). Related to BUG-01 |
| BUG-03 | MEDIUM (HIGH in R1) | CONFIRMED | Partners see the customer (company) name: in the trip list, trip detail, invoice line description and invoice label | PR-05: "Oslo Choir Society" is in P1's `/trips/all`, `/trips/trip-1` and `/invoices/inv-1` pages. Contract §2.1 and §2.4, and BR-04, mark it host-only. POC FR4.2 only names the price, so the POC requirements do not cover this BRD rule. `views.ts` `tripViewFor`, `invoices.ts` `createInvoice` line description, `app.ts` invoice route |
| BUG-04 | LOW | CONFIRMED | Forbidden actions answer HTTP 400 instead of 403 | PR-07. `app.ts` `handle` maps only `not_found` → 404 |
| BUG-05 | LOW | CONFIRMED | The new-trip form's default-price hint differs from the saved default by 0.01 | PR-04: customer 9.50 at 85 % shows hint 8.07, but 8.08 is saved. The page script uses `Math.round(v*rate*100)/100`, while the server uses `round2` |
| BUG-06 | LOW | CONFIRMED | VAT rate with more than 2 decimals is stored but shown rounded; saving the unchanged form silently changes it | PR-09: 12.345 % is stored, the field shows 12.35, and the VAT is 123.45 |
| BUG-07 | LOW | CONFIRMED | A request without a company cookie acts as the host, and no form has CSRF protection, so any web page can cancel or reset the demo | PR-06: a cookieless `POST /trips/trip-10/cancel` → 303, Cancelled by host. Documented "no sign-in" design (README), so this matters only if the app is exposed |
| BUG-08 | LOW | CONFIRMED | Amount limits allow results above the float-safe range | PR-08: qty 999 999 999 × 999 999 999.99 gives a net off by about 1 cent. Unrealistic input; R1 uses integer minor units (AR-06) |
| SUS-01 | — | NEEDS VERIFICATION | The partner can change the agreed offer-price line (×10 accepted) before submitting | PR-12. BN-INV-04 prefills the line; nothing in the BRD says whether it is locked. Business decision needed |
| SUS-02 | — | NEEDS VERIFICATION | Customer price 0 and offer price 0 are accepted | PR-03. POC requirements are silent; R1 T1 requires offer price > 0 |
| SUS-03 | — | NEEDS VERIFICATION | Reject is still allowed after planned start, but accept is not | PR-13. D2 restricts only accept; may be intended |
| OBS-01 | — | info | A double submit of the share form creates two trips | PR-10. Idempotency is R1 (ES-23, DR-08), not a POC requirement |

Not reproduced: PR-11 (no customer price, other offers or other partner names in any partner trip view); PR-14 (3 000 random actions → 453 trips, 1 013 company/trip pairs; tab check PASS, no unexpected errors, history chains consistent).

## 7. Remaining plan

1. Finish Phase 3: prototype review; HTTP boundary and negative cases per route; dashboard figures vs lists after random walks; invoice-lock and resubmit edges; seed/reset idempotency.
2. Write the six Phase 9 deliverables in this folder.
3. Wait for approval before any fix (Phase 7). Fix order proposed: BUG-03 → BUG-01/02 → BUG-06 → BUG-05 → BUG-04 → rest.

Probe script (not part of the project): `/tmp/claude-1000/-home-bs01169-Desktop-E2E-BusNetwork/1023bb3b-7989-4519-96c0-967ff026d05a/scratchpad/probes/probe.mts`.
