# Requirements Analysis — Questions

> Context: the approved intent (`ideation/intent-capture/intent-statement.md`) says the POC must prove four things for host-side and partner-side users: the one-status tab rule, sharing a trip with accept/reject, turning a closed trip into an approved or declined invoice, and an action dashboard. It passes on a click-through demo plus a tab-placement check across all six trip statuses. These questions decide how much of the BRD (`_bmad-output/planning-artifacts/brd/busnetwork-brd-v1/BRD.md`) the POC reproduces, and which way it goes where the BRD is still open.

## Q1. When a trip is shared with several partners and more than one accepts, who gets it?

The BRD rule says the first partner to accept gets the trip and the other offers are withdrawn (BR-03), but it lists this as still open (BRD question Q4: or should the host choose?). The POC has to behave one way.

A. First partner to accept wins; the other offers are withdrawn automatically (BR-03 as written)
B. The host chooses among the partners who accepted
C. Sidestep it: the POC shares each trip with exactly one partner
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. How should time-driven status changes happen during a demo?

In the BRD, a trip moves from Accepted to In progress at its planned start, and to Completed at its planned end (or when the partner marks it complete). A demo can't wait hours for that.

A. A demo control that moves a "current time" forward, so the scheduled changes fire on demand
B. Real clock time, with demo trips planned a few minutes apart
C. Manual buttons only: "Start trip" and "Mark complete"
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q3. What form should the POC take?

This decides what gets built in Code Generation. Your success check needs real status logic, not static screens.

A. A small standalone web app with seeded sample data, run locally, no connection to TEQ
B. A clickable prototype with fake data and no real logic
C. Built inside the existing TEQ platform
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q4. How much detail should each flow carry?

The BRD specifies many fields and rules, such as a four-step request form with 12 field types, three price agreement types, VAT, and extra invoice lines. A POC can prove the ideas with far less.

A. Thin slice: a few trip fields (customer, from/to, planned start/end, partner), one offer price per partner that can be edited, and an invoice of offer price plus VAT with the statuses Draft, Pending, Approved, Declined
B. Thin slice as in A, plus extra invoice lines (description, quantity, unit price, VAT rate)
C. The full BRD field set and rules
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q5. How should the POC reach Cancelled and Rejected, so the tab check covers all six statuses?

The tab-placement check needs trips in every status: Requested, Accepted, In progress, Completed, Cancelled, Rejected.

A. Real flows: cancel with a reason (host or partner); Rejected when every partner rejects or a response deadline passes
B. Real flows for cancel and partner reject only; no response deadline
C. Seed trips in all six statuses; only the main flow (share, accept, start, complete) is interactive
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q6. What should the dashboard show?

The intent asks for "what needs my action now". The BRD dashboard also has key figures, upcoming trips, and charts.

A. Key figures (awaiting response, active trips, open invoices) plus a "Needs your action" list for the signed-in side
B. The "Needs your action" list only
C. The full BRD dashboard, including upcoming trips and charts
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q7. Which non-functional qualities matter for this POC? (select all that apply)

Everything here is optional for a throwaway proof; picking none keeps it to the functional checks.

A. Two demo companies (one host, one partner) with a switch between them, each seeing only its own trips and invoices (BR-04)
B. A history log of every status change, with who and when (NFR-04)
C. Statuses shown as text labels, not colour alone (part of NFR-07)
D. None: functional checks only
E. Not yet defined
X. Other (please specify)

[Answer]: A

## Q8. How many partner companies should the demo have? (follow-up)

Two answers conflict. "First partner to accept wins, the other offers are withdrawn" (Q1) only happens when a trip is shared with two or more partners. But the demo companies were set as one host and one partner (Q7).

A. One host and two partner companies, with a switch between all three; each sees only its own trips and invoices
B. Keep one host and one partner; first-to-accept is not demonstrated in the POC
C. One host and three or more partner companies
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Consolidated Summary Confirmation

- Several acceptors (Q1): the first partner to accept gets the trip; the other offers are withdrawn automatically (BR-03 as written).
- Demo time (Q2): a demo control moves "current time" forward, so Accepted → In progress (at planned start) and In progress → Completed (at planned end) fire on demand.
- POC form (Q3): a small standalone web app with seeded sample data, run locally, with no connection to TEQ.
- Flow detail (Q4): a thin slice. A few trip fields (customer, from/to, planned start/end, partners), an editable offer price per partner, and an invoice of offer price plus extra lines (description, quantity, unit price, VAT rate) with VAT. Invoice statuses: Draft, Pending, Approved, Declined.
- End states (Q5): real flows for cancel with a reason (host or partner) and partner reject; Rejected when every partner rejects; no response deadline.
- Dashboard (Q6): key figures (awaiting response, active trips, open invoices) plus a "Needs your action" list for the current company.
- Demo companies (Q7, Q8): one host and at least three partner companies, with a switch between them; each sees only its own trips and invoices (BR-04). No other non-functional requirements.

Does this all look correct before I generate the requirements artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
