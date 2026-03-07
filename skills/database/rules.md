# Skill: Database

- Use the project's ORM or query builder. Do not write raw SQL unless no ORM is present.
- Never hardcode connection strings. Always read from environment variables.
- Use migrations for all schema changes. Do not alter tables manually.
- Avoid N+1 queries. Use eager loading or batching where needed.
- Wrap multi-step writes in transactions to ensure consistency.
- Do not expose database errors directly to API consumers.
