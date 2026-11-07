# Release boundaries

*Companion to SPEC.md (BN-SPEC-001). What ships in which release, what is deliberately left where it is today, and which open decisions move a boundary.*

---

## 1. Release slices (from BRD MoSCoW priorities)

| Slice | Rule | Requirements |
|---|---|---|
| **R1** | Every *Must* (50) | BN-LST-01…05, 07, 08, 10 · BN-DSH-01…04, 08 · BN-REQ-01, 03, 04, 05, 09, 10 · BN-ACT-01…07 · BN-DTL-01…06 · BN-CLS-01…06 · BN-ALL-01…04 · BN-INV-01…08 — plus BR-01…09, BRD §11 notifications, NFR-01…08 |
| **R1.1** | Every *Should* (12) | BN-LST-06, 09 · BN-DSH-05, 06 · BN-REQ-02, 06, 08 · BN-ACT-08 · BN-CLS-07 · BN-ALL-06 · BN-INV-09, 10 |
| **Later** | Every *Could* (4) | BN-DSH-07 · BN-REQ-07 · BN-ACT-09 · BN-ALL-05 |

**Sequencing recommendation (PRD §3.3):** pull **BN-REQ-08** (response deadline) into R1. Without it, OBJ-2 can't be met, the "Request expiring in 2 h" notification has nothing to fire on, and a Requested trip whose planned start passes has no exit. This is a recommendation to the Product Owner; the BRD priority is unchanged until they decide.

## 2. Out of scope — and where it stays

From BRD §4 *Out of scope (this release)*.

| Excluded | Stays in / handled by | Portal behaviour |
|---|---|---|
| Managing partner agreements and rates | *Planning › BusNetwork Settings* | Portal reads affiliations, agreement type and rate; never edits them |
| Assigning vehicles and drivers | *Planning* | Portal shows vehicle *requirements* only |
| Posting invoices to accounting (Fortnox, SIE4) | Each company's accounting | Invoice List ends at Approved; PDF download available (BN-INV-09) |
| Collecting payments, reconciling payments | Each company's finance | No Paid status (Q2) |
| Customer-facing booking portal changes | Existing booking portal | None |
| Mobile driver app | Not planned | None |

## 3. Boundaries that open decisions can move

| BRD question | Current boundary | If decided the other way |
|---|---|---|
| Q1 — Invoice List replaces Claim Settlement? | Coexistence during rollout (PRD §15.4) | Replacement: add a cut-over step and retire Claim Settlement with legacy screens |
| Q2 — *Paid* status? | Four statuses | Add `PAID` after `APPROVED`; Archive rule and dashboard figure change |
| Q3 — Reopen closed trips? | Not possible (BN-CLS-06) | Add a guarded transition back to the previous status with role, time limit and history entry |
| Q4 — First to accept wins? | Yes (BR-03) | Accepts become "interested" responses; host chooses; others withdrawn at choice |
| Q5 — Auto-complete at planned end? | Automatic + manual Mark complete | Remove scheduler T6; Completed only by partner confirmation; reminder needed |
| Q6 — Default response deadline? | Defaults to planned start (PRD WA-10) | Company-level default duration; still capped at planned start |
| Q7 — Partner names in charts? | Shown | Anonymise per affiliation flag |

## 4. Coexistence with legacy screens

- *Sales › Network*, *Sales › Network Trips* and *Invoice › Claim Settlement* keep their current behaviour until the portal fully replaces them (BRD §14 constraint).
- Both read and write the same Bus Network service data, so a trip changed in either place shows the same status in both.
- Retirement criterion (PRD §15.4): M-4 ≥ 90% for two consecutive months and Q1 decided.
