# Context: Backend

- Validate all input at system boundaries (API requests, external data).
- Never expose internal errors or stack traces to API consumers.
- Use environment variables for secrets and config. Never hardcode credentials.
- Prefer idempotent operations where possible.
- Log meaningful events, not noise. Include context (request ID, user ID) in logs.
- Write database queries that scale. Avoid N+1 queries.
