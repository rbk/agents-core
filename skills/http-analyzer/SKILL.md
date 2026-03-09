---
name: http-analyzer
description: Converts raw curl commands or HTTP request snippets into reusable, well-structured JavaScript HTTP request files using axios. Invoke this skill when the user provides a curl command, raw HTTP request, or asks to convert/reuse an HTTP request in JavaScript.
metadata:
  version: "1.0.0"
---

# HTTP Analyzer Skill

Convert raw curl commands or HTTP request snippets into reusable JavaScript HTTP request functions using axios.

## What This Skill Does

1. Parses a raw curl command or HTTP request
2. Extracts method, URL, headers, query params, and body
3. Outputs a clean, reusable JavaScript module using axios

## Input Formats Supported

- Raw curl commands: `curl -X POST https://api.example.com/endpoint -H "Authorization: Bearer TOKEN" -d '{"key":"value"}'`
- HTTP request snippets (plain text with method/URL/headers/body)

## Output Format

Produce a JavaScript file at `requests/<name>.js` with this structure:

```js
import axios from 'axios';

/**
 * <description of what the request does>
 * @param {Object} params - Dynamic values to inject
 * @returns {Promise<Object>} response data
 */
export async function <functionName>(params = {}) {
  const { /* destructure dynamic params */ } = params;

  const response = await axios({
    method: '<METHOD>',
    url: '<BASE_URL>',
    headers: {
      '<Header-Name>': '<value or template literal>',
      // ... other headers
    },
    // include params: {} if query string exists
    // include data: {} if request body exists
  });

  return response.data;
}
```

## Rules

- Replace hardcoded auth tokens/secrets with `params.token` or `process.env.VAR_NAME`
- Replace hardcoded IDs or variable values with destructured `params`
- Use template literals for dynamic URL segments
- Keep headers as a plain object — no magic
- Add a JSDoc comment describing what the endpoint does
- Name the function using camelCase derived from the endpoint path (e.g., `/users/search` → `searchUsers`)
- Save output to `requests/<descriptive-name>.js`

## Example

**Input:**
```bash
curl -X GET "https://api.github.com/repos/anthropics/claude-code/issues?state=open&per_page=10" \
  -H "Authorization: Bearer ghp_mytoken" \
  -H "Accept: application/vnd.github+json"
```

**Output** (`requests/getGithubIssues.js`):
```js
import axios from 'axios';

/**
 * Fetch open issues from a GitHub repository
 * @param {Object} params
 * @param {string} params.token - GitHub personal access token
 * @param {string} params.owner - Repository owner
 * @param {string} params.repo - Repository name
 * @param {number} [params.perPage=10] - Results per page
 * @returns {Promise<Array>} list of issues
 */
export async function getGithubIssues({ token, owner, repo, perPage = 10 }) {
  const response = await axios({
    method: 'GET',
    url: `https://api.github.com/repos/${owner}/${repo}/issues`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
    params: {
      state: 'open',
      per_page: perPage,
    },
  });

  return response.data;
}
```
