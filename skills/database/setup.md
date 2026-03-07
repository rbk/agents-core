# Skill Setup: Database

Follow these steps to set up database access for this project.

## Steps

1. **Ask the user which database they are using** (PostgreSQL, MySQL, SQLite, MongoDB, etc.).

2. **Ask for the connection string** or individual credentials (host, port, user, password, database name).

3. **Add to `.env`:**
   - `DATABASE_URL=<connection string>`
   - Or individual vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

4. **Check if an ORM or query builder is already in use** (Sequelize, Prisma, Drizzle, Knex, Mongoose).
   - If not, ask the user which they prefer and install it.

5. **Append the contents of `skills/database/rules.md` to the project's agent config file** (`CLAUDE.md`, `.cursorrules`, or `.github/copilot-instructions.md` — whichever is present).

6. **Confirm setup** by summarizing what was configured.
