# Security Policy

## Reporting a vulnerability

If you find a security issue, please **do not open a public issue**. Instead, report it privately via [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository.

Include:

- A description of the issue and its impact
- Steps to reproduce
- Affected versions, if known

I'll acknowledge reports within a few days and aim to ship a fix or mitigation within a reasonable timeframe given the severity.

## Scope

cubestats is a single-user self-hosted app. The threat model assumes:

- The instance is run by one operator on infrastructure they control.
- The HMAC secret (`NUXT_AUTH_SECRET`) and login password (`NUXT_AUTH_PASS`) are kept secret by the operator.
- Postgres is not exposed to the public internet.

In production (`NODE_ENV=production`), the server refuses to start if `NUXT_AUTH_SECRET`, `NUXT_AUTH_PASS`, or `NUXT_DATABASE_URL` are missing or use placeholder defaults.

## Out of scope

- Multi-tenant isolation issues (cubestats is single-user by design).
- Vulnerabilities in csTimer export files supplied by the operator themselves (operator trusts their own data).
- Denial-of-service from a logged-in operator against their own instance.
