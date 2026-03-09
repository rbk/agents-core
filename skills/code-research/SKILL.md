---
name: code-research
description: Looks up the most current documentation for libraries, frameworks, and APIs, then caches the results locally for reuse. Invoke this skill when the user needs up-to-date docs, API references, or wants to check the latest version/usage of a library.
metadata:
  version: "1.0.0"
---

# Code Research Skill

Look up current documentation and cache results locally for fast reuse.

## What This Skill Does

1. Searches for the latest docs for a given library, framework, or API
2. Extracts the relevant information (usage, API, examples)
3. Saves the result to a local database as a cache
4. On subsequent lookups, checks the cache first before fetching again

## Steps

1. Check the local database for a cached entry matching the query
2. If cached and recent (< 7 days old), return the cached version
3. If not cached or stale, fetch the latest docs via web search/fetch
4. Extract and structure: library name, version, key APIs, usage examples
5. Save/update the cache entry in the database
6. Present the findings to the user

## Cache Entry Format
```json
{
  "_id": "<uuid>",
  "library": "<library name>",
  "version": "<latest version found>",
  "query": "<original search query>",
  "content": {
    "summary": "<brief overview>",
    "apis": ["<key API methods/functions>"],
    "examples": ["<code examples>"],
    "source": "<documentation URL>"
  },
  "cachedAt": "<ISO 8601>",
  "expiresAt": "<ISO 8601, cachedAt + 7 days>"
}
```

## Rules

- Always check cache before making external requests
- Cache entries expire after 7 days — refetch when stale
- Store the source URL for every piece of documentation
- Keep summaries focused on practical usage, not history
- Version-pin the docs — note which version the docs are for
