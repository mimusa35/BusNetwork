# Intent Capture & Framing — Questions

## Sources

- [desc] Initial description: "[Project description]"
- [scope] Workflow-selected scope: `poc`.

> The workflow was started with only the word "poc" and no description of what to build, so these questions establish what the proof-of-concept is for. Options reference the BusNetwork portal planning set in this workspace (BN-BRD-001) as a starting point; pick "Other" if the POC is about something else entirely.

## Q1. What should this proof-of-concept prove?

Nothing has been described yet, so this sets the whole direction. (select all that apply)

A. That a trip's single status alone decides which tab shows it (Active / Closed / All) — the BusNetwork "one status" rule (BR-01)
B. That a host can create a trip, share it with partners, and partners can accept or reject it
C. That a closed trip can be turned into an invoice that the other side approves or declines
D. That a dashboard can show "what needs my action now" across trips and invoices
E. Not yet defined
X. Other (please specify)

[Answer]: A, B, C, D

## Q2. Who is the POC for — who must be convinced or helped by it?

This decides whose view of the problem the POC is shaped around. (select all that apply)

A. Sales / Dispatcher users on the host side
B. Partner Coordinators on the partner side
C. Finance users who settle what each side owes
D. Internal decision-makers (product / engineering leadership) deciding whether to build the real thing
E. Not yet defined
X. Other (please specify)

[Answer]: A, B

## Q3. What result would make you say the POC succeeded?

A POC needs a clear pass/fail so we know when to stop.

A. A working demo of the flow that stakeholders can click through end to end
B. A demo plus a measurable check (for example: across all six trip statuses, every trip appears in exactly one of Active or Closed, and always in All)
C. Clear answers to specific open decisions (for example: first partner to accept wins vs. host chooses — Q4; automatic vs. partner-confirmed completion — Q5)
D. Evidence that the idea is technically feasible inside the existing TEQ platform
E. Not yet defined
X. Other (please specify)

[Answer]: B

## Q4. Why now — what triggered this POC?

Knowing the trigger tells us what the POC must de-risk first.

A. The BRD is finalized and the team wants to validate it before building release 1
B. Open decisions are blocking BRD approval and the POC should help settle them
C. Stakeholder buy-in or funding depends on seeing something working
D. A technical risk needs to be reduced before committing
E. Not identified
X. Other (please specify)

[Answer]: A

## Q5. Who decides on the POC's outcome, and how should progress be reported?

This shapes the stakeholder map and communication plan.

A. Just me — a solo exploration, no formal reporting
B. The product owner decides; a single demo at the end
C. Product, Finance and Operations review together, with a regular check-in
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q6. This workflow was started as a proof-of-concept (`poc`). Does that match what you intend?

A `poc` run is lightweight: capture intent, write requirements, then build and test — no design, deployment, or operations stages.

A. Yes — confirm `poc`: a throwaway or exploratory proof, minimal process
B. No — this should define a different product boundary (for example an MVP or a real release slice); I'll describe it
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q7. Who is the invoice part of the POC for? (follow-up)

You chose to prove that a closed trip becomes an invoice the other side approves or declines (Q1 C), but Finance users — who settle what each side owes — are not in the audience (Q2). This resolves that gap.

A. Host and partner users (Sales / Dispatcher, Partner Coordinator) handle invoices themselves in the POC
B. Add Finance users to the POC audience
C. Drop the invoice flow from the POC
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- What the POC proves (Q1): the one-status rule decides which tab shows a trip; a host shares a trip and partners accept or reject; a closed trip becomes an invoice the other side approves or declines; a dashboard shows what needs action now.
- Who it is for (Q2, Q7): Sales / Dispatcher (host side) and Partner Coordinator (partner side); these same users handle invoices themselves in the POC.
- Success (Q3): a click-through demo plus a measurable check — across all six trip statuses, every trip appears in exactly one of Active or Closed, and always in All.
- Trigger (Q4): the BRD is finalized and should be validated before building release 1.
- Decision and reporting (Q5): a solo exploration by you, no formal reporting.
- Scope (Q6): confirmed `poc` — a throwaway or exploratory proof with minimal process.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
