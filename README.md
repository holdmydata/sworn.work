# sworn.work

Hyperlocal task marketplace MVP for Northwest Arkansas, focused on fair pay and verification-first trust.

## Stack
- SvelteKit + TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS v4
- better-auth (currently partially wired; see Notes)

## Current MVP Surface
Public routes:
- `/`
- `/how-it-works`
- `/for-workers`
- `/tasks`
- `/tasks/[id]`

Auth routes:
- `/login`
- `/signup`

App routes (auth-intended):
- `/dashboard`
- `/dashboard/tasks`
- `/dashboard/messages`
- `/dashboard/profile`
- `/tasks/create`

API/ops routes:
- `/api/health/db`

## Task and Trust Model (In Progress)
- Public task board shows safe fields only (title, category, budget, city/state, verification type, preview)
- Exact street address is hidden until assignment logic permits visibility
- Task verification flow supports:
  - `verification_type`: `photo` | `video` | `both`
  - `task_proofs` submissions
  - `verification_decisions` by poster (`approved` / `disputed` / `rejected`)

## Local Development

### Prerequisites
- Node.js `22.13.x` (use `.nvmrc` with `nvm use`)
- Docker (for local PostgreSQL)

### 1) Install
```bash
npm install
```

### 2) Environment
Create `.env.local`:
```bash
DATABASE_URL="postgres://sworn:CHANGE_ME@localhost:5433/sworn_work"
ORIGIN="http://localhost:5173"
BETTER_AUTH_SECRET="REPLACE_WITH_HIGH_ENTROPY_SECRET"
```

### 3) Start Postgres (Docker)
```bash
npm run db:start
```

### 4) Apply migrations
```bash
npm run db:migrate
```

### 5) Seed sample tasks
```bash
npm run db:seed:sample
```

### 6) Run app
```bash
npm run dev
```

## Useful Commands
- `npm run db:start` — start postgres via docker compose
- `npm run db:migrate` — apply Drizzle SQL migrations
- `npm run db:seed:sample` — seed posters/tasks for testing
- `npm run db:studio` — open Drizzle Studio
- `npm run check` — Svelte + TypeScript checks
- `npm run lint` — Prettier + ESLint

## Important Notes
- `src/hooks.server.ts` is currently a temporary pass-through to avoid a known better-auth package resolution issue in this workspace.
- Better-auth is scaffolded, but full auth/session wiring is not yet production-ready.
- There is ongoing TS/module-resolution cleanup work pending, so `npm run check` may report unrelated baseline errors.

## Security
- Do not commit `.env.local`
- Keep `.env.example` placeholder-only
- Use `PUSH_CHECKLIST.md` before pushing

## Docs
- `PROJECT.md` — product plan and build status
- `docs/task-visibility.md` — public vs logged-in field visibility
- `docs/graphic-style.md` — graphics/copy style guide
