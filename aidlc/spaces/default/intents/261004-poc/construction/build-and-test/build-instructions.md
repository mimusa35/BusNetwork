# Build Instructions — BusNetwork Portal POC

Built from `construction/code-generation/code-summary.md` and the approved `construction/code-generation/code-generation-plan.md`.

## Prerequisites

- Node.js 20 or newer (verified on Node 22.23.1, npm 10.9.8).
- No database, external services, credentials or environment files are needed.

## Dependency Installation

```bash
cd poc
npm ci        # exact versions from package-lock.json (use npm install only when changing dependencies)
```

## Environment Setup

| Variable | Default | Meaning |
|----------|---------|---------|
| `PORT` | `3000` | Port the web app listens on. An invalid value or a port already in use stops the server with a logged message. |

The app keeps all data in memory and rebuilds it from the seed on every start and on **Reset**.

## Build Commands

There is no compile or bundle step: `tsx` runs the TypeScript source directly. The build check is the type check.

```bash
cd poc
npm run typecheck   # tsc --noEmit, strict mode
```

## Run

```bash
cd poc
npm start           # http://localhost:3000
```

## Build Verification

1. `npm run typecheck` exits 0.
2. `npm start` logs `listening on http://localhost:<port>`.
3. `GET /` returns 200 and shows the dashboard for Nordic Coaches AS.
4. `GET /tab-check` returns 200 and reports PASS.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `EADDRINUSE` on start | Port already in use | Stop the other process, or start with `PORT=<other> npm start` |
| `tsx: not found` | Dependencies not installed | Run `npm ci` in `poc/` |
| Type errors after editing | Strict TypeScript settings | Run `npm run typecheck` and fix the reported files |
