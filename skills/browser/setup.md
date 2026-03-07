# Skill Setup: Browser

Follow these steps to set up browser automation for this project.

## Steps

1. **Check if a headless browser service is available.**
   - Look for `BROWSERLESS_URL` or similar in the project's `.env`.
   - If not present, ask the user which browser service they want to use:
     - **Browserless** (hosted): https://browserless.io — ask for their API token.
     - **Local Playwright**: no API key needed, just install the package.

2. **For Browserless:**
   - Add `BROWSERLESS_URL=https://chrome.browserless.io` and `BROWSERLESS_TOKEN=<token>` to `.env`.

3. **For local Playwright:**
   - Run: `npm install playwright` (or `pnpm add playwright`).
   - Run: `npx playwright install chromium`.

4. **Append the browser skill rules to `CLAUDE.md`.**
   - Copy the contents of `skills/browser/rules.md` into the project's `CLAUDE.md`.

5. **Confirm setup** by summarizing what was configured.
