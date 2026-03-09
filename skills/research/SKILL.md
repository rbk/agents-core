---
name: research
description: Sets up web search via Brave Search API and performs research with cited results. Invoke this skill when the user needs to search the web, find information, or research a topic with sources.
metadata:
  version: "1.0.0"
---

# Research Skill

Web search and research with cited results using the Brave Search API.

## Setup

1. Ask the user for their Brave Search API key
   - If they don't have one, direct them to: https://brave.com/search/api/
   - The free tier allows 2,000 queries/month
2. Add the key to the project `.env` file: `BRAVE_API_KEY=<key>`
   - If no `.env` exists, create one
3. Check if `.env` is in `.gitignore`. If not, add it
4. Confirm setup is complete

## Usage

Search endpoint: `https://api.search.brave.com/res/v1/web/search`

Required header: `X-Subscription-Token: <BRAVE_API_KEY>`

## Rules

- Use the Brave Search API (`BRAVE_API_KEY`) for web searches
- Always cite sources with URLs when referencing web content
- Summarize findings concisely before presenting raw results
- If search results are insufficient, say so and suggest refining the query
- Do not fabricate citations or statistics
