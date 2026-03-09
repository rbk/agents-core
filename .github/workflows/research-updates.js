#!/usr/bin/env node
/**
 * Researches weekly updates from AI coding platforms and MCP ecosystem,
 * then creates GitHub issues for significant findings.
 *
 * Uses:
 * - Jina Reader (free, no auth) to fetch changelog pages
 * - GitHub Models (free, uses GITHUB_TOKEN) for AI analysis
 * - GitHub Issues API (uses GITHUB_TOKEN) to create issues
 */

const TODAY = new Date().toISOString().split("T")[0];
const GITHUB_API = "https://api.github.com";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GITHUB_MODELS_API = "https://models.inference.ai.azure.com/chat/completions";
const GITHUB_MODEL = "gpt-4o-mini";

// Prefer Groq if key is set, otherwise fall back to GitHub Models
const AI_ENDPOINT = process.env.GROQ_API_KEY ? GROQ_API : GITHUB_MODELS_API;
const AI_MODEL = process.env.GROQ_API_KEY ? GROQ_MODEL : GITHUB_MODEL;
const AI_TOKEN = process.env.GROQ_API_KEY ?? process.env.GITHUB_TOKEN;

const PLATFORMS = [
  {
    name: "Anthropic Claude",
    label: "anthropic-claude",
    changelogUrls: [
      "https://docs.anthropic.com/en/release-notes/overview",
      "https://docs.anthropic.com/en/release-notes/claude-code",
    ],
    focus:
      "Claude models, Claude Code CLI, API changes, system prompt behavior, new capabilities, pricing, rate limits",
  },
  {
    name: "Cursor",
    label: "cursor",
    changelogUrls: ["https://www.cursor.com/changelog"],
    focus:
      "Cursor IDE features, .cursorrules format changes, agent mode, MCP support, model context window changes",
  },
  {
    name: "GitHub Copilot",
    label: "github-copilot",
    changelogUrls: [
      "https://github.blog/changelog/label/copilot/",
      "https://docs.github.com/en/copilot/about-github-copilot/github-copilot-changelog",
    ],
    focus:
      "Copilot features, custom instructions format, workspace rules, extensions, agent mode, supported models",
  },
  {
    name: "OpenAI Codex",
    label: "openai-codex",
    changelogUrls: [
      "https://platform.openai.com/docs/changelog",
      "https://openai.com/news/",
    ],
    focus:
      "Codex CLI, OpenAI API changes, new models for coding, system prompt behavior, tool use changes",
  },
  {
    name: "MCP (Model Context Protocol)",
    label: "mcp",
    changelogUrls: [
      "https://github.com/modelcontextprotocol/specification/releases",
      "https://modelcontextprotocol.io/changelog",
      "https://github.com/modelcontextprotocol/servers/releases",
    ],
    focus:
      "MCP spec changes, new protocol versions, new official MCP servers, harness/SDK updates (Python, TypeScript), breaking changes, new transport types, sampling/tool/resource spec changes",
  },
];

async function fetchChangelog(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  try {
    const res = await fetch(jinaUrl, {
      headers: { Accept: "text/plain", "X-Return-Format": "text" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Trim to avoid blowing token limits; keep the most recent content at top
    return text.slice(0, 6000);
  } catch (err) {
    console.warn(`  Could not fetch ${url}: ${err.message}`);
    return null;
  }
}

async function analyzeWithAI(platform, changelogContent) {
  const systemPrompt = `You are a technical researcher tracking AI developer tool updates.
Today's date is ${TODAY}. Focus only on changes from the last 7 days.
Respond with valid JSON only — no markdown fences, no prose outside the JSON.`;

  const userPrompt = `Analyze the following changelog content for "${platform.name}".
Focus areas: ${platform.focus}

Identify updates from the last 7 days that are relevant to a repository that maintains
AI coding rules, agent configurations, and skills for AI coding tools (like .cursorrules,
CLAUDE.md, Copilot instructions, MCP server configs, etc.).

Changelog content:
---
${changelogContent}
---

Respond with this exact JSON shape:
{
  "platform": "${platform.name}",
  "updates": [
    {
      "title": "short descriptive title (max 80 chars)",
      "summary": "one sentence plain-language summary of the change (no markdown)",
      "source_url": "direct URL to the changelog entry or announcement page",
      "description": "what changed and why it matters",
      "impact": "how this affects AI coding rules/agent configs in this repo",
      "action_needed": true,
      "priority": "high | medium | low"
    }
  ],
  "summary": "one sentence overall summary, or 'No significant updates this week.'"
}

For source_url, use the most specific URL to the actual changelog entry or announcement.
The changelog pages being analyzed are: ${platform.changelogUrls.join(", ")}

Only include updates that are genuinely new (last 7 days). If nothing is new, return an empty updates array.`;

  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub Models API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from GitHub Models");

  return JSON.parse(content);
}

async function getExistingIssues() {
  const url = `${GITHUB_API}/repos/${process.env.GITHUB_REPOSITORY}/issues?labels=ai-updates&state=open&per_page=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) return [];
  return res.json();
}

async function closeStaleIssues(existingIssues) {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  let closed = 0;

  for (const issue of existingIssues) {
    const createdAt = new Date(issue.created_at);
    if (createdAt < twoWeeksAgo) {
      const res = await fetch(
        `${GITHUB_API}/repos/${process.env.GITHUB_REPOSITORY}/issues/${issue.number}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: JSON.stringify({
            state: "closed",
            state_reason: "not_planned",
          }),
        }
      );
      if (res.ok) {
        console.log(`  Closed stale issue #${issue.number}: ${issue.title}`);
        closed++;
      } else {
        console.error(`  Failed to close issue #${issue.number}`);
      }
    }
  }

  return closed;
}


function buildChangelogBody(allUpdates) {
  let md = `> Weekly AI platform updates — ${TODAY}\n\n`;

  for (const p of PLATFORMS) {
    md += `## ${p.name}\n\n`;

    const match = allUpdates.find((u) => u.platform.label === p.label);
    const updates = match?.result?.updates ?? [];

    if (updates.length === 0) {
      md += `_No updates this week._\n\n`;
      continue;
    }

    for (const update of updates.slice(0, 5)) {
      const summary = update.summary || update.description;
      const url = update.source_url || p.changelogUrls[0];
      md += `- ${summary} ([source](${url}))\n`;
    }
    md += `\n`;
  }

  md += `---\n`;
  md += `*Auto-generated by the [AI Updates workflow](../../actions/workflows/ai-updates.yml).*`;
  return md;
}

async function closePreviousChangelogIssues() {
  const url = `${GITHUB_API}/repos/${process.env.GITHUB_REPOSITORY}/issues?labels=ai-updates,changelog&state=open&per_page=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) return 0;

  const issues = await res.json();
  let closed = 0;

  for (const issue of issues) {
    const patchRes = await fetch(
      `${GITHUB_API}/repos/${process.env.GITHUB_REPOSITORY}/issues/${issue.number}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ state: "closed", state_reason: "completed" }),
      }
    );
    if (patchRes.ok) {
      console.log(`  Closed previous changelog issue #${issue.number}`);
      closed++;
    }
  }

  return closed;
}

async function createIssue(title, body, labels) {
  const res = await fetch(
    `${GITHUB_API}/repos/${process.env.GITHUB_REPOSITORY}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ title, body, labels }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create issue: ${err}`);
  }
  return res.json();
}

function isDuplicate(title, existingTitles) {
  const normalized = title.toLowerCase();
  return existingTitles.some((t) => t.toLowerCase() === normalized);
}

function buildIssueBody(platform, update) {
  return `## ${update.title}

**Platform:** ${platform.name}
**Priority:** ${update.priority}
**Action Needed:** ${update.action_needed ? "Yes" : "No"}
**Detected:** ${TODAY}

### What Changed
${update.description}

### Impact on This Repo
${update.impact}

---
*Auto-generated by the [AI Updates workflow](../../actions/workflows/ai-updates.yml). Review and close when addressed.*`;
}

async function researchPlatform(platform) {
  console.log(`\nResearching ${platform.name}...`);

  const contents = await Promise.all(platform.changelogUrls.map(fetchChangelog));
  const combined = contents.filter(Boolean).join("\n\n---\n\n");

  if (!combined.trim()) {
    console.log(`  No changelog content fetched for ${platform.name}`);
    return null;
  }

  console.log(`  Fetched ${combined.length} chars of changelog content`);

  const result = await analyzeWithAI(platform, combined);
  console.log(`  Summary: ${result.summary}`);
  console.log(`  Updates found: ${result.updates?.length ?? 0}`);

  return result;
}

async function main() {
  const required = ["GITHUB_TOKEN", "GITHUB_REPOSITORY"];
  for (const env of required) {
    if (!process.env[env]) throw new Error(`Missing required env var: ${env}`);
  }

  console.log(`AI Platform Update Research — ${TODAY}`);

  const existingIssues = await getExistingIssues();
  const existingTitles = existingIssues.map((i) => i.title);

  // Close issues that have been open for more than 2 weeks
  console.log("\nClosing stale issues (open > 2 weeks)...");
  const stalesClosed = await closeStaleIssues(existingIssues);
  console.log(`  Closed ${stalesClosed} stale issue(s).`);

  let issuesCreated = 0;
  const allUpdates = [];

  for (const platform of PLATFORMS) {
    let result;
    try {
      result = await researchPlatform(platform);
    } catch (err) {
      console.error(`  Error researching ${platform.name}: ${err.message}`);
      continue;
    }

    if (result) {
      allUpdates.push({ platform, result });
    }

    if (!result?.updates?.length) continue;

    for (const update of result.updates) {
      // Skip low-priority items that don't need action
      if (!update.action_needed && update.priority === "low") continue;

      const title = `[${platform.name}] ${update.title}`;

      if (isDuplicate(title, existingTitles)) {
        console.log(`  Skipping duplicate: ${title}`);
        continue;
      }

      const labels = ["ai-updates", platform.label, `priority-${update.priority}`];
      const body = buildIssueBody(platform, update);

      try {
        const issue = await createIssue(title, body, labels);
        console.log(`  Created issue #${issue.number}: ${title}`);
        issuesCreated++;
        existingTitles.push(title); // Prevent dupes within same run
      } catch (err) {
        console.error(`  Failed to create issue "${title}": ${err.message}`);
      }
    }
  }

  // Close previous changelog issues and create a new one
  console.log("\nClosing previous changelog issues...");
  const changelogsClosed = await closePreviousChangelogIssues();
  console.log(`  Closed ${changelogsClosed} previous changelog issue(s).`);

  const changelogBody = buildChangelogBody(allUpdates);
  const changelogTitle = `AI Platform Updates — ${TODAY}`;
  const changelogIssue = await createIssue(changelogTitle, changelogBody, [
    "ai-updates",
    "changelog",
  ]);
  console.log(`  Created changelog issue #${changelogIssue.number}`);

  console.log(`\nDone. Created ${issuesCreated} issue(s), closed ${stalesClosed} stale issue(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
