# BusNetwork

BusNetwork is a portal inside TEQ Platform. In it, a **host** bus company shares trips with **partner** companies, follows each trip until it is finished, and settles what each side owes. Six tabs: Dashboard, Request, Active Trips, Closed Trips, All Trips, Invoice List.

The one rule that shapes everything: **a trip has exactly one status, and that status alone decides which tab shows it** (BR-01).

## What is in this repository

| Folder | What it is |
|---|---|
| [docs/](docs/) | The final planning set made with the **BMAD method**: BRD, PRD, UX, SPEC, architecture and a clickable prototype. BMAD writes here (`output_folder = docs`). |
| [poc/](poc/) | A throwaway TypeScript proof of concept of the core rules |
| [aidlc/](aidlc/) | The AI-DLC workflow record that produced the POC (written by the engine) |
| `_bmad/`, `.agents/`, `.claude/` | Tooling: the BMAD method install and skills, the AI-DLC framework, and shared skills |

## Start here

1. [docs/PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md): what BusNetwork is, in one page.
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): repository layout, how the documents depend on each other, the target architecture, and how the POC maps onto it.
3. [docs/planning-artifacts/brd/busnetwork-brd-v1/BRD.md](docs/planning-artifacts/brd/busnetwork-brd-v1/BRD.md): the source of truth. Precedence is **BRD › PRD › SPEC › Architecture › UX › POC**.

## Run it

**Prototype** (no install): open `docs/planning-artifacts/ux-designs/ux-busnetwork-2026-08-26/prototype/BusNetwork-Demo.html` in a browser.

**POC** (needs Node.js 20 or newer):

```bash
cd poc
npm install
npm start           # http://localhost:3000
npm test            # 44 tests
npm run typecheck
```

## Open decisions

The following are still open and block R1: BRD Q1–Q7, plus PQ-01, PQ-02, PQ-04, PQ-10 and PQ-15 (and PQ-13 for finance). They are listed in [docs/PROJECT-CONTEXT.md](docs/PROJECT-CONTEXT.md) §7, and their effect on scope is in [docs/specs/spec-busnetwork-v1-architecture/v1-boundaries.md](docs/specs/spec-busnetwork-v1-architecture/v1-boundaries.md) §3.
