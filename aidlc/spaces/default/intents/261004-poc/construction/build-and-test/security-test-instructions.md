# Security Test Instructions — BusNetwork Portal POC

The requirements set no security targets for this POC, and the test strategy is Minimal. The approved design does have one security-relevant rule, company isolation (NFR1, BR-04), and the app takes user input. So a small set of checks is recorded here and was run in this stage.

## How to Run

```bash
cd poc
npm audit                                   # dependency vulnerabilities (all dependencies)
npx vitest run test/domain/views.test.ts    # company isolation and partner-safe view (NFR1, FR1.3, FR4.2)
npx vitest run test/web/app.test.ts         # input validation at the HTTP boundary (FR2.1)
```

## Checks and What They Show

| Check | Expected | Notes |
|-------|----------|-------|
| `npm audit` | 0 vulnerabilities | Run with and without `--omit=dev` |
| Company isolation tests | Pass | A partner never sees another partner's trip, offer or invoice; records outside a company's view return 404 over HTTP |
| Input validation tests | Pass | Invalid form input returns 400 with the field named; all HTML output is escaped by default (`src/web/html.ts`) |

## Accepted POC Limitations (not tested, by design)

These come from the Code Generation review (findings R-01, R-02), accepted at its approval:

- **No sign-in.** The company switcher lets anyone act as any company. This is deliberate for the POC (requirements Q7) and is stated in `poc/README.md` and `poc/src/web/app.ts`.
- **Listens on all network interfaces.** `app.listen(port)` binds every address, so anyone on the same network can use the switcher or Reset. Run the POC only on your own machine or a trusted network.
- **No CSRF protection** on the forms that change data. The low real risk follows from the two points above.

None of these may carry over into a real release. Release 1 must use TEQ's login and per-call permission checks (BRD NFR-03).
