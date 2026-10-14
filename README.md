# CadChat Design Review

Click a 3D part, leave a design review comment, then approve or reject it. Reviews are stored in
Supabase through a Node.js API.

**Live demo:** https://cadchat-review.onrender.com (free tier: the first request after a while
can take ~30 s while the API wakes up)

**Stack:** React 19 · TypeScript · Tailwind v4 · Three.js · React Three Fiber · Drei ·
TanStack Query · Express 5 · Supabase (Postgres) · Turborepo · Vitest · Playwright

## Getting started

Prerequisites: **Node 24+** and **Docker** (running).

```sh
npm install
npm run setup   # creates .env files, starts local Supabase, applies migrations, seeds a cube
npm run dev     # web on http://localhost:5173, API on http://localhost:3001/api
```

Open http://localhost:5173 and click the cube.

Supabase Studio (database UI): http://127.0.0.1:55323

## Scripts

| Command | |
|---|---|
| `npm run dev` | start the web app and the API |
| `npm run setup` | one-time local setup (see above) |
| `npm run db:start` / `npm run db:stop` | start / stop the local Supabase containers |
| `npm run db:reset` | wipe the local database, re-apply migrations, re-seed |
| `npm run migrate` | apply new migrations and regenerate the database types |
| `npm run check-types` / `npm run lint` | TypeScript / Biome across all packages |
| `npm run build` | production build of the web app |

## Tests

```sh
npm test           # unit tests (shared) + API tests (needs the local database: npm run db:start)
npm run test:e2e   # Playwright smoke test against the running app (npm run dev)
```

The API test runs against the local dev database and deletes what it creates. Before the first
e2e run, install the browser once: `npx playwright install chromium`.

## Project structure

```
apps/web            React + React Three Fiber + Drei frontend
apps/api            Express API
packages/database   Supabase config, migrations, seed, and data access (parts, reviews)
packages/shared     Types and validation shared by the web app and the API
```

## API

| Method | Path | |
|---|---|---|
| GET | `/api/parts` | parts in the scene |
| GET | `/api/parts/:partId/reviews/current` | latest review, or `null` |
| GET | `/api/parts/:partId/reviews` | all reviews, newest first |
| POST | `/api/parts/:partId/reviews` | `{ comment }` → new pending review (201) |
| GET | `/api/reviews/:id` | one review |
| PATCH | `/api/reviews/:id` | `{ status }` → approve / reject |
| DELETE | `/api/reviews/:id` | delete (204) |

Errors return `{ "error": { "code", "message" } }` with status 400, 404, 409 or 500.

## Deploy

[`render.yaml`](render.yaml) deploys to Render:
- The API runs as a Node web service.
- The web app is a static site that forwards `/api/*` to the API.

The database is a Supabase Cloud project:

```sh
npx supabase link --project-ref <ref>   # from packages/database
npx supabase db push --include-seed
```

Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` on the API service in the Render dashboard.
