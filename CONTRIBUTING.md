# Contributing

Thanks for your interest in cubestats. Issues and PRs are welcome.

## Filing issues

Before opening an issue, please search existing ones to avoid duplicates. When filing:

- **Bugs**: include reproduction steps, expected vs actual behavior, and your environment (OS, browser, Node version, deployment method).
- **Feature requests**: describe the use case, not just the feature. "I want X so I can Y" is more useful than "add X."
- **Security issues**: do **not** open a public issue. See [SECURITY.md](./SECURITY.md).

## Development setup

Requires Node 22+ and a running Postgres. The fastest path is Docker Compose for the database:

```bash
git clone <your-fork-url>
cd cubestats
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:migrate
npm run dev
```

## Submitting a pull request

1. Fork and create a feature branch off `main`.
2. Keep PRs focused — one logical change per PR.
3. Run the checks before pushing:
   ```bash
   npm run test:run
   npm run build
   ```
4. Write a brief PR description: what changed and why. Screenshots are appreciated for UI changes.

## Code style

- TypeScript everywhere. Prefer explicit types at module boundaries.
- Vue components use `<script setup lang="ts">`.
- Server routes go under `server/api/`, follow the existing nested pattern.
- Database changes: edit `server/database/schema.ts`, then `npm run db:generate` to produce a migration. Don't hand-edit migrations.

## Tests

- Server logic in `tests/server/` — Vitest.
- Frontend coverage is currently thin; tests for new components are encouraged but not required.

## Scope

cubestats is intentionally **single-user and self-hosted**. PRs that move it toward multi-tenant SaaS (per-user accounts, billing, public sign-up, etc.) are out of scope. If you need that, fork.
