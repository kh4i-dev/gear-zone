# 0001. Use Neon PostgreSQL For Production

## Status

Accepted

## Context

GearZone originally used SQLite for local development. The Azure Ubuntu deployment target uses Neon PostgreSQL, and production deployment needs repeatable schema changes, remote database connectivity, and a data import path from the local SQLite database.

## Decision

Use PostgreSQL as the Prisma datasource and manage production schema changes with Prisma Migrate. Use Neon's pooled connection string as `DATABASE_URL` for runtime and Neon's direct connection string as `DIRECT_URL` for migrations.

## Consequences

- Production deployments run `prisma migrate deploy`, not `prisma db push`.
- Local SQLite data must be imported through an explicit migration/import script.
- Environment examples must include both `DATABASE_URL` and `DIRECT_URL`.
- Product pages must avoid stale build-time catalog snapshots.
