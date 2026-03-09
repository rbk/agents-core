---
name: browser
description: Sets up and manages headless browser automation via Browserless or local Playwright. Invoke this skill when the user needs web scraping, page automation, or browser-based testing.
metadata:
  version: "1.0.0"
---

# Browser Skill

Set up and use headless browser automation for scraping, testing, and page interaction.

## Setup

1. Check if a headless browser service is available
   - Look for `BROWSERLESS_URL` or similar in the project's `.env`
   - If not present, ask the user which browser service they want:
     - **Browserless** (hosted): https://browserless.io — ask for their API token
     - **Local Playwright**: no API key needed, just install the package

2. **For Browserless:**
   - Add `BROWSERLESS_URL=https://chrome.browserless.io` and `BROWSERLESS_TOKEN=<token>` to `.env`

3. **For local Playwright:**
   - Run: `npm install playwright` (or `pnpm add playwright`)
   - Run: `npx playwright install chromium`

4. Confirm setup by summarizing what was configured

## Rules

- Use the configured browser service (Browserless or local Playwright) for all page scraping and automation
- Always close browser sessions after use to avoid resource leaks
- Extract clean text content when possible rather than raw HTML
- Handle navigation errors and timeouts gracefully — do not crash on a failed page load
- Respect `robots.txt` and rate limits. Do not hammer sites with rapid repeated requests
