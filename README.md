# CadChat Design Review

Click a 3D part, leave a design review comment, then approve or reject it. Reviews are stored in
Supabase through a Node.js API.

**Live demo:** https://cadchat-review-kk89.onrender.com (free tier: the first request after a while
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
npx playwright install chromium   # once, for the e2e test
npm test                          # unit + API + e2e (needs the local database: npm run db:start)
```

Each layer can also run on its own: `npm test -w @cadchatscg/shared`, `npm test -w @cadchatscg/api`
or `npm run test:e2e`.

The API test runs against the local dev database and deletes what it creates. The e2e test starts
the app itself, or reuses `npm run dev` if it's running. Set `BASE_URL` to run it against a deployed
copy instead.

## Project structure

```
apps/web            React + React Three Fiber + Drei frontend
apps/api            Express API
packages/database   Supabase config, migrations, seed, and data access (parts, reviews)
packages/shared     Types and validation shared by the web app and the API
```

## Data model

```sql
review_status = enum ('pending', 'approved', 'rejected')
parts   (id uuid pk, name text, created_at timestamptz)
reviews (id uuid pk, part_id → parts on delete cascade, comment text not blank,
         status review_status default 'pending', created_at, updated_at)
```

- A part can have many reviews; the **current** review is the latest one.
- At most one review per part can be pending (partial unique index).
- `updated_at` is kept by a trigger (`moddatetime`).
- RLS is enabled with no policies, so only the API's secret key can read or write.

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

## Decisions & tradeoffs

- **Status transitions live in one table** (`REVIEW_TRANSITIONS` in `shared`). The API enforces
  it, and the UI renders its buttons from it.
- **Concurrent decisions are safe.** The status update is a single conditional
  `UPDATE … WHERE status IN (allowed sources)`. If two reviewers decide at once, the second one
  gets a 409 and the panel refetches to show the real state.
- **The model layer is a package.** The API calls `parts.list()` and `reviews.updateStatus()`,
  and never sees supabase-js, tables or rows. Queries use supabase-js with generated types.
  - Tradeoff: no multi-statement transactions; an ORM such as Drizzle could replace this layer.
- **Reviews are history, not a single row.** "Current" is just the latest review, so
  "Start over" or a review-history view need no schema change.
- **There is a `parts` table** instead of one hard-coded cube. The scene renders whatever is in
  it, so a second part is one INSERT.
- **The overlay is Drei `<Html>`:** real DOM pinned to a 3D point.
  - `<Html>` renders into a separate React root, so the query hooks run outside it and the
    panel content receives plain props.
  - Clicks on the panel are kept from counting as clicks on the 3D scene.
- **TanStack Query handles server state; `useState` handles the selected part.** Reviews are
  fetched when a part is clicked.
- **No build step for the API.** Node 24 runs the TypeScript directly; `tsc --noEmit` checks it.

## Time & scope

The brief asks for 120 minutes. I spent longer: about an hour of planning that isn't in the git
history, then about 3 hours building with an AI pair-programmer (Claude Code), including a final
pass to simplify the code.

- **The core of the brief fits the timebox:** the cube, the Drei panel, the review states, the
  Express CRUD API and the Supabase schema.
- **The rest was deliberate:**
  - the monorepo split (frontend, backend and database are separate packages)
  - race-safe status changes
  - one example test per layer
  - the deploy

## With more time

- Auth, plus permission checks on who may approve.
- Soft delete and an audit log of decisions (who decided, and when), so history can't be removed.
- Editing comments, a review-history panel, and comments pinned to a point on the model.
- Live updates between reviewers (polling, SSE or Supabase Realtime).
- Real CAD models (`useGLTF`), stored part positions, and code-splitting Three.js.
- More tests on an isolated test database: model-layer tests, panel component tests, e2e for
  the full review flow.

## Deploy

Deployed at https://cadchat-review-kk89.onrender.com. The pieces:

- **Web app:** a Render static site (`cadchat-review`), which forwards `/api/*` to the API so the
  browser only talks to one origin, as with the Vite proxy in dev.
- **API:** a Render web service (`cadchat-review-api`, https://cadchat-review-api.onrender.com).
- **Database:** a Supabase Cloud project.

Both Render services are defined in [`render.yaml`](render.yaml) and run on the free plan. Render
redeploys them on every push to `main`.

To deploy your own copy:

1. Create a Supabase project, then apply the migrations and seed from `packages/database`:
   ```sh
   npx supabase link --project-ref <ref>
   npx supabase db push --include-seed
   ```
2. In Render, choose New → Blueprint and connect the repo.
3. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (the `sb_secret_…` key) on the API service.
4. Render may add a suffix to the static site URL if the name is taken. Check the URL it gives the
   `cadchat-review` service.
