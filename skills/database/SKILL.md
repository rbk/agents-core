---
name: database
description: Sets up database access including connection strings, ORM selection, and migration patterns. Invoke this skill when the user needs to connect to a database, set up an ORM, or configure database access for a project.
metadata:
  version: "1.0.0"
---

# Database Skill

Set up database access for a project — connection, ORM, and best practices.

## Setup

1. Ask the user which database they are using (PostgreSQL, MySQL, SQLite, MongoDB, etc.)
2. Ask for the connection string or individual credentials (host, port, user, password, database name)
3. Add to `.env`:
   - `DATABASE_URL=<connection string>`
   - Or individual vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
4. Check if an ORM or query builder is already in use (Sequelize, Prisma, Drizzle, Knex, Mongoose)
   - If not, ask the user which they prefer and install it
5. Confirm setup by summarizing what was configured

## Rules

- Use the project's ORM or query builder. Do not write raw SQL unless no ORM is present
- Never hardcode connection strings. Always read from environment variables
- Use migrations for all schema changes. Do not alter tables manually
- Avoid N+1 queries. Use eager loading or batching where needed
- Wrap multi-step writes in transactions to ensure consistency
- Do not expose database errors directly to API consumers
