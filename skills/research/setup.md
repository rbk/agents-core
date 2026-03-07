# Skill Setup: Research

Follow these steps to set up the research skill for this project.

## Steps

1. **Ask the user for their Brave Search API key.**
   - If they don't have one, direct them to: https://brave.com/search/api/
   - The free tier allows 2,000 queries/month.

2. **Add the key to the project `.env` file.**
   - Append: `BRAVE_API_KEY=<key>`
   - If no `.env` exists, create one.

3. **Check if `.env` is in `.gitignore`.** If not, add it.

4. **Append the research skill rules to `CLAUDE.md`.**
   - Copy the contents of `skills/research/rules.md` into the project's `CLAUDE.md`.

5. **Confirm setup is complete** by summarizing what was configured.
