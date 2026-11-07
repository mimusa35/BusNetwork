# BusNetwork — Project Context

**Product:** BusNetwork portal (TEQ Platform) · **Source of truth:** BN-BRD-001 v1.0 (16 Sep 2026, final) · **Owner:** Product · **Updated:** 2026-09-16

> This page is the short orientation for anyone joining the project. It summarises the BRD; it does not add to it. Where this page and the BRD differ, the BRD wins.


---

## 1. What it is

BusNetwork is one portal where bus operators on TEQ **share trips with partner companies, follow each trip until it's finished, and settle what each side owes.**

Today the same work is spread across four TEQ areas — *Sales › Network*, *Sales › Network Trips*, *Planning › BusNetwork Settings* and *Invoice › Claim Settlement*. The portal replaces that with one navigation bar:

| Tab | What it's for |
|---|---|
| **Dashboard** | What needs my action now, what's running soon, how the network is doing |
| **Request** | Create a trip and share it with one or more partners (4-step form) |
| **Active Trips** | Open trips — Requested, Accepted, In progress |
| **Closed Trips** | Finished trips — Completed, Cancelled, Rejected; start an invoice |
| **All Trips** | Every trip, any status (Active + Closed = All) |
| **Invoice List** | Incoming and outgoing invoices for Completed trips; approve / decline |

## 2. Why it exists

The exchange itself already works: a **host company** shares normal or fixed trips with **partner companies**, each partner is offered a price from its agreement (percentage, full day, half day), the partner accepts or rejects, and closed trips are settled through claims. What's broken is how people use it:

- **Fragmented navigation** — sharing, tracking and settlement live in three modules.
- **No overview** — nothing shows what's waiting, what's running today, or what needs approval.
- **Unclear trip status** — "active" and "archive" mean different things on different screens.
- **Settlement is separate from trips** — hard to see what is owed for a given trip.

## 3. The one rule that shapes everything

**A trip has exactly one status, and that status alone decides which tab shows it** (BR-01).

```
Active Trips:  Requested ──► Accepted ──► In progress
                   │  │          │             │
                   │  └──────────┴─► Cancelled │
                   └─► Rejected                ▼
Closed Trips:            Cancelled · Rejected · Completed ──► invoice
All Trips:     all six
```

Requested → Rejected happens when every partner rejects or the response deadline passes. Accepted → In progress and In progress → Completed are driven by the TEQ Scheduler at planned start/end (or a partner marks complete).

## 4. Objectives

| ID | Objective | Target |
|---|---|---|
| OBJ-1 | Faster hand-off to a partner | Median request→acceptance time −30% in 6 months |
| OBJ-2 | Fewer unanswered requests | < 10% of requests expire with no response |
| OBJ-3 | Faster settlement | Median trip closed → invoice approved ≤ 7 days |
| OBJ-4 | One place to work | ≥ 90% of network tasks done without leaving the portal |
| OBJ-5 | Trustworthy lists | Status / missing-trip support tickets −50% in 6 months |

## 5. Who uses it

| Role | Main tabs |
|---|---|
| Sales / Dispatcher (host side) | Dashboard, Request, Active, All |
| Partner Coordinator (partner side) | Dashboard, Active, Closed |
| Finance User | Dashboard, Closed, Invoice List |
| Company Admin | All |
| Viewer / Management (read-only) | Dashboard, All |

A company can be host on one trip and partner on another. Visibility is scoped by the user's company, role and departments, as elsewhere in TEQ.

## 6. Scope boundaries

**In:** portal shell and six tabs; dashboard; creating and sharing normal/fixed trips; Active/Closed/All lists and trip detail; accept / reject / cancel with reason; comment threads; Invoice List with approve/decline; lifecycle notifications.

**Out (this release):** managing partner agreements and rates (stays in BusNetwork Settings); assigning vehicles and drivers (stays in Planning); posting invoices to accounting (Fortnox, SIE4); collecting payments; customer booking portal changes; a mobile driver app.

## 7. Decisions still open (block BRD approval)

| ID | Question | Owner |
|---|---|---|
| Q1 | Invoice List replaces Claim Settlement, or runs alongside it? | Product / Finance |
| Q2 | Track *Paid* as a fifth invoice status? | Finance |
| Q3 | Can a Completed or Cancelled trip be reopened? | Operations |
| Q4 | First to accept wins, or host chooses among acceptors? | Sales |
| Q5 | Completed automatic at planned end, or partner-confirmed? | Operations |
| Q6 | Default response deadline; per-company override? | Sales |
| Q7 | Show or hide partner names in dashboard charts? | Product |

## 8. Where things live

| Artifact | Path |
|---|---|
| BRD (BN-BRD-001) | `docs/planning-artifacts/brd/busnetwork-brd-v1/BRD.md` |
| PRD (BN-PRD-001) | `docs/planning-artifacts/prd/busnetwork-prd-v1/PRD.md` |
| Validation report | `docs/planning-artifacts/prd/busnetwork-prd-v1/VALIDATION-REPORT.md` |
| Technical SPEC + companions | `docs/specs/spec-busnetwork-v1-architecture/` |
| Architecture Spine | `docs/planning-artifacts/architecture/architecture-BusNetwork-2026-08-26/ARCHITECTURE-SPINE.md` |
| UX package + clickable prototype | `docs/planning-artifacts/ux-designs/ux-busnetwork-2026-08-26/` |
| Architecture overview (repo map, target design, POC mapping) | `docs/ARCHITECTURE.md` |
| Decision log per document | `.memlog.md` beside each BMAD document |
| POC (throwaway code) | `poc/` |

**Reading the documents.** Cite requirement IDs, not wording: `BN-LST/DSH/REQ/ACT/DTL/CLS/ALL/INV-nn` (functional), `BR-01..09` (rules), `NFR-01..08`, `OBJ-1..5`, `Q1..Q7`. Priorities are MoSCoW. IDs are never reused; a removed requirement is marked withdrawn.
