# cubestats

A self-hosted stats viewer for [csTimer](https://cstimer.net) exports. Import your csTimer JSON, browse your solve history, and see deeper analytics than the built-in views.

> Not affiliated with csTimer.

<picture>
  <img alt="Dashboard" src="docs/screenshots/dashboard.png">
</picture>

## Screenshots

<table>
<tr>
<td width="50%">

**Analytics** — distribution, calendar heatmap, time-of-day
<picture>

  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/analytics-dark.png">
  <img alt="Analytics" src="docs/screenshots/analytics-light.png">
</picture>

</td>
<td width="50%">

**Trends** — rolling averages and week-over-week
<picture>

  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/trends-dark.png">
  <img alt="Trends" src="docs/screenshots/trends-light.png">
</picture>

</td>
</tr>
<tr>
<td width="50%">

**Timer** — WCA scrambles, hold-to-start
<picture>

  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/timer-dark.png">
  <img alt="Timer" src="docs/screenshots/timer-light.png">
</picture>

</td>
<td width="50%">

**History** — searchable solve table with penalty editing
<picture>

  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/history-dark.png">
  <img alt="History" src="docs/screenshots/history-light.png">
</picture>

</td>
</tr>
<tr>
<td width="50%">

**Sessions** — per-session detail and stats
<picture>

  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/session-detail-dark.png">
  <img alt="Session detail" src="docs/screenshots/session-detail-light.png">
</picture>

</td>
<td width="50%">

**Import / Export** — drag-and-drop csTimer JSON
<picture>

  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/import-dark.png">
  <img alt="Import / Export" src="docs/screenshots/import-light.png">
</picture>

</td>
</tr>
</table>

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

Nuxt 4 · Vue 3 · Pinia · Nuxt UI 4 · Tailwind · SQLite + Drizzle ORM · Chart.js · Vitest

## Quick start (Docker)

Single-container, no compose required. Pick a password and a long random secret:

```bash
docker run -d --name cubestats \
  -p 3000:3000 \
  -v cubestats-data:/app/data \
  -e NUXT_AUTH_USER=admin \
  -e NUXT_AUTH_PASS='<your-login-password>' \
  -e NUXT_AUTH_SECRET='<a-long-random-string>' \
  --restart unless-stopped \
  mattyfaz/cubestats:latest
```

Open <http://localhost:3000>, log in, then drop a csTimer export onto the Import page.

### Or with Docker Compose

```yml
services:
  cubestats:
    image: mattyfaz/cubestats:latest
    ports:
      - 3000:3000
    environment:
      - NUXT_AUTH_USER=admin
      - NUXT_AUTH_PASS=<your-login-password>     # required — server refuses to boot with "changeme", "admin", or "password"
      - NUXT_AUTH_SECRET=<a-long-random-string>  # required — must not start with "change-this", "dev-secret", or "changeme"
    volumes:
      - cubestats-data:/app/data
    restart: unless-stopped

volumes:
  cubestats-data:
```

The image is published to [Docker Hub](https://hub.docker.com/r/mattyfaz/cubestats) and [GHCR](https://github.com/MattFaz/cubestats/pkgs/container/cubestats) for `linux/amd64` and `linux/arm64`. Your data lives in the `cubestats-data` volume — back up `cubestats.db` from inside it to keep your solves safe.

## Local development

Requires Node 22+. Database is a local SQLite file — no external services needed.

```bash
npm install
cp .env.example .env
# Edit .env — set NUXT_AUTH_PASS / NUXT_AUTH_SECRET to anything
npm run db:migrate    # creates data/cubestats.db
npm run dev
```

## Environment variables

| Var                  | Required | Notes                                                                                        |
| -------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `NUXT_AUTH_USER`     | yes      | Login username                                                                               |
| `NUXT_AUTH_PASS`     | yes      | Login password — refuses to start in production with `changeme`, `admin`, or `password`      |
| `NUXT_AUTH_SECRET`   | yes      | HMAC secret for the session cookie — refuses to start in production with placeholder values  |
| `NUXT_DATABASE_PATH` | no       | SQLite file path. Defaults to `data/cubestats.db` (locally) or `/app/data/cubestats.db` (in the docker image) |
| `APP_PORT`           | no       | Defaults to `3000`                                                                           |

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
