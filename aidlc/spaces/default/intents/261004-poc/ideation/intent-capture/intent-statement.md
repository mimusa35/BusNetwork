# Intent Statement — BusNetwork Portal Proof-of-Concept

## Problem Statement

The BusNetwork portal requirements are finalized, but nobody has yet seen them working together. This proof-of-concept checks that the core ideas hold up before release 1 is built. [Q4]

The POC must show four things:

- A trip's single status alone decides which tab shows it (Active, Closed, All). [Q1]
- A host can create a trip and share it with partners, and partners can accept or reject it. [Q1]
- A closed trip can be turned into an invoice that the other side approves or declines. [Q1]
- A dashboard can show "what needs my action now" across trips and invoices. [Q1]

## Target Customer

| Who | How they benefit | Source |
|-----|------------------|--------|
| Sales / Dispatcher users (host side) | See that creating and sharing a trip, following its status, and settling it work as one flow | [Q2] [Q1] |
| Partner Coordinators (partner side) | See that responding to shared trips, following their status, and settling them work as one flow | [Q2] [Q1] |

In the POC, these same host and partner users handle invoices themselves; no separate Finance role is involved. [Q7]

## Success Metrics

| Metric | Pass criterion | Source |
|--------|----------------|--------|
| End-to-end demo | The flow can be clicked through from creating and sharing a trip to an approved or declined invoice, with the dashboard reflecting pending actions | [Q3] [Q1] |
| Tab placement check | Across all six trip statuses, every trip appears in exactly one of Active or Closed, and always in All | [Q3] |

## Initiative Trigger

The BRD is finalized, and the team wants to check it before committing to build release 1. [Q4]

## Initial Scope Signal

| Signal | Value | Source |
|--------|-------|--------|
| Workflow-selected scope | `poc` (workflow-selected) | [scope] |
| User-confirmed product boundary | A throwaway or exploratory proof with minimal process | [Q6] |

## Assumptions & Open Questions

None.
