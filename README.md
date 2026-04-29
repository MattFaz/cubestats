# cubestats

A self-hosted stats viewer for [csTimer](https://cstimer.net) exports. Import your csTimer JSON, browse your solve history, and see deeper analytics than the built-in views.

> Single-user by design. Run it for yourself; not a multi-tenant service. Not affiliated with csTimer.

## Features

- **Dashboard** — best/avg5/avg12/avg100 with live filters by session and puzzle type
- **History** — searchable, sortable solve table with penalty editing
- **Analytics** — solve-time distribution, calendar heatmap, time-of-day breakdown
- **Trends** — rolling averages and session comparisons over time
- **Sessions** — per-session detail pages
- **Built-in timer** — WCA-compliant scrambles via [cubing.js](https://js.cubing.net), inspection countdown
- **Goals** — track targets for any stat metric
- **Import** — drag-and-drop csTimer JSON; deduplicates on re-import
- **Multi-puzzle** — 2x2 through 7x7, megaminx, pyraminx, skewb, square-1
- **Light & dark mode**

## Stack

Nuxt 4 · Vue 3 · Pinia · Nuxt UI 4 · Tailwind · Postgres + Drizzle ORM · Chart.js · Vitest

## Quick start (Docker Compose)

```bash
git clone https://github.com/<your-org>/cubestats.git
cd cubestats
cp .env.example .env
# Edit .env — at minimum, change AUTH_PASS and AUTH_SECRET
docker compose up -d
open http://localhost:3000
```

Log in with the credentials from your `.env`, then drop a csTimer export onto the Import page.

## Local development

Requires Node 22+ and a running Postgres.

```bash
npm install
cp .env.example .env
# Edit .env to point at your Postgres
npm run db:migrate
npm run dev
```

## Environment variables

| Var | Required | Notes |
|-|-|-|
| `NUXT_DATABASE_URL` | yes | Postgres connection string |
| `NUXT_AUTH_USER` | yes | Login username |
| `NUXT_AUTH_PASS` | yes | Login password — refuses to start in production with default `changeme` |
| `NUXT_AUTH_SECRET` | yes | HMAC secret for the session cookie — refuses to start in production with default placeholder |
| `APP_PORT` | no | Defaults to `3000` |

The Docker Compose setup also reads non-prefixed `DATABASE_URL`, `AUTH_USER`, `AUTH_PASS`, `AUTH_SECRET`, `POSTGRES_*` for convenience — see `.env.example`.

## Exporting from csTimer

In csTimer, open the export menu and choose **Export**. Save the resulting JSON file and drag it onto the Import page in cubestats.

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Vitest watch
npm run test:run     # Vitest single run
npm run db:generate  # Generate Drizzle migration from schema
npm run db:migrate   # Apply migrations
npm run db:studio    # Drizzle Studio
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Security issues: see [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)

## Acknowledgements

- [csTimer](https://cstimer.net) — the timer this tool reads from
- [cubing.js](https://js.cubing.net) — scramble generation
