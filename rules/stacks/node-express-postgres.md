---
stack: node-express-postgres
---

# Stack: Node.js + Express + PostgreSQL

Opinionated rules for production API development with Node.js, Express 5, and PostgreSQL.

## Node.js

- Use ESM (`"type": "module"` in package.json). No CommonJS `require()`.
- Target Node.js 22+. Use native `fetch`, `crypto`, and `URL` — don't polyfill.
- Use `dotenv` only in dev. In production, environment variables come from the host.
- Pin dependency versions in `package.json`. No `^` or `~` in production deps.

## Express

- Use Express 5. Use `express.Router()` to split routes by resource.
- Wrap all async route handlers with a try/catch or an `asyncHandler` utility — Express 5 does not auto-catch promise rejections in older middleware patterns.
- Route structure: `routes/` → `controllers/` → `services/`. Keep business logic out of route files.
- Apply middleware in this order: security headers → cors → body parser → request logger → routes → error handler.
- Use `helmet()` for security headers and `express-rate-limit` on public endpoints.
- Validate request input with `zod` at the controller layer before touching services.
- Return consistent JSON: `{ data }` for success, `{ error: { message, code } }` for errors.
- Use HTTP status codes correctly: 200 GET/PUT, 201 POST, 204 DELETE, 400 validation, 401 auth, 403 forbidden, 404 not found, 409 conflict, 500 server error.

## PostgreSQL

- Use `pg` (node-postgres) with a connection pool. Never create per-request connections.
- Use parameterized queries everywhere — never string-interpolate user input into SQL.
- Keep schema migrations in a `migrations/` directory. Use `node-pg-migrate` or similar.
- Use transactions for operations that touch multiple tables.
- Index foreign keys and columns used in frequent WHERE/ORDER BY clauses.
- Store timestamps as `TIMESTAMPTZ` (UTC). Return ISO 8601 strings to clients.
- Use UUIDs (`gen_random_uuid()`) as primary keys, not serial integers.

## Auth

- Use JWT for stateless auth. Sign with RS256 (asymmetric) in production.
- Store refresh tokens in the database so they can be revoked.
- Never store plaintext passwords. Use `bcrypt` with a cost factor of 12+.
- Protect routes with an `authenticate` middleware that validates the JWT before the controller runs.

## Project Structure

```
src/
  app.js           # Express app setup (no listen call)
  server.js        # Starts the server (calls app.listen)
  routes/          # Router files, one per resource
  controllers/     # Request/response handling, input validation
  services/        # Business logic, database calls
  middleware/      # Auth, error handler, request logger
  db/
    pool.js        # pg Pool instance
    migrations/    # SQL migration files
  lib/             # Shared utilities
```

## Error Handling

- Define a central error handler middleware (4 args: `err, req, res, next`).
- Use a custom `AppError` class with `statusCode` and `code` fields for expected errors.
- Log unexpected errors with a full stack trace server-side; send a generic message to the client.

## Testing

- Use Vitest with `supertest` for integration tests against the Express app.
- Test each route: happy path, validation errors, auth failures, not-found cases.
- Use a separate test database. Reset it between test suites with migrations.
