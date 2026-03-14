# sworn.work

Hyperlocal task marketplace for Northwest Arkansas.

This repository is both:
- the active codebase for the site, and
- a public-facing showcase of the product direction.

## Current Focus
- Trust-first task board
- Reputation and progression foundations (reviews, XP, levels, badges)
- Mobile-first SvelteKit UI

## Tech Stack
- SvelteKit + TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS
- Bun
- better-auth (integration in progress)

## Routes (MVP Surface)
Public:
- `/`
- `/how-it-works`
- `/for-workers`
- `/tasks`
- `/tasks/[id]`

Auth:
- `/login`
- `/signup`

App:
- `/dashboard`
- `/dashboard/tasks`
- `/dashboard/messages`
- `/dashboard/profile`
- `/tasks/create`

Ops:
- `/api/health/db`

## Local Setup
### Prerequisites
- Node.js `22.13.x` (`nvm use`)
- Docker (local Postgres)

### Install
```bash
bun install
```

### Environment
Create `.env.local` from `.env.example` and fill your local values.

Required vars:
- `DATABASE_URL`
- `ORIGIN`
- `BETTER_AUTH_SECRET`

Optional/currently used in some flows:
- `SESSION_SECRET`
- `BADGE_EARLY_ADOPTER_CUTOFF`

### Run
```bash
bun run db:start
bun run db:migrate
bun run db:seed:sample
bun run dev
```

## Useful Commands
- `bun run check` — Svelte + TypeScript checks
- `bun run lint` — Prettier + ESLint
- `bun run db:start` — start Postgres via Docker
- `bun run db:migrate` — apply migrations
- `bun run db:seed:sample` — seed sample tasks
- `bun run db:studio` — open Drizzle Studio

## Security and Publish Hygiene
- Never commit real secrets.
- Keep `.env` files local only.
- Keep `.env.example` placeholder-only.
- Run the pre-publish checklist before pushing/deploying.

If your local history ever contained real credentials, rotate them before deploy.

## Notes
- Auth scaffolding exists, but full production hardening is still in progress.
- Product and UI are being actively iterated.
