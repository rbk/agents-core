# Skill: Browser

## Rules

- Use the configured browser service (Browserless or local Playwright) for all page scraping and automation.
- Always close browser sessions after use to avoid resource leaks.
- Extract clean text content when possible rather than raw HTML.
- Handle navigation errors and timeouts gracefully — do not crash on a failed page load.
- Respect `robots.txt` and rate limits. Do not hammer sites with rapid repeated requests.
