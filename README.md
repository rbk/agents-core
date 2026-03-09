# agents-core

Every AI coding agent starts fresh. It doesn't know how you like to work, what standards you hold, or what skills it has access to. You end up re-explaining the same preferences across every project, every tool, and every conversation.

**agents-core** is a single source of truth for your coding rules and agent skills. Define them once, install them anywhere — Claude Code, Cursor, GitHub Copilot, Codex CLI, or any LLM that reads a project config file. Rules are plain markdown so they're readable by any agent without special tooling.

When you start a new project, one `curl` command installs your rules. When you want your agent to gain a new capability — like web search or database access — you tell it to set up the skill and it follows the instructions itself.

## Concepts

| Concept | Description |
|---------|-------------|
| **Agent presets** | Named bundles of rules + skills — one command to configure a full agent |
| **Core rules** | `alwaysApply: true` — always active, every project |
| **Roles** | What the agent is doing: coding, research, planning, review |
| **Contexts** | What domain it's working in: frontend, backend, devops, data, testing |
| **Skills** | Additive capabilities — some are setup guides, some are agent instructions |

## How rules work in your project

After running `agents use` or `agents setup`, your project gets:

```
.agents/
  rules/
    core-coding.md     ← edit these freely
    coding.md
    backend.md
  manifest.json        ← tracks installed versions + checksums
CLAUDE.md              ← generated from .agents/rules/, inside markers
```

**Edit `.agents/rules/*.md`** to customize rules for your project. Your edits are tracked separately from the remote source, so they're never blindly overwritten.

```bash
agents diff     # see what changed between your local rules and remote
agents sync     # pull remote updates — skips any rule you've edited locally
```

`sync` handles three cases per rule:
- **Remote updated, local untouched** → updates automatically
- **Local edited, remote unchanged** → keeps your edits
- **Both changed** → flags as a conflict, you resolve manually

If a local edit is worth contributing back, open a PR against this repo.

Add `.agents/` to your project's `.gitignore` if you don't want to commit the rule copies, or commit them to share your customizations with your team.

## Agent Presets

The fastest way to configure an agent for a project. One command installs all the rules and skills for that type of work.

```bash
npx agents-core use api                          # auto-detect platform
npx agents-core use api --platform codex         # explicit platform
npx agents-core use frontend --platform cursor   # Cursor project
```

`use` installs rules into the platform's config file and copies skills into the platform's skills directory.

### Available Presets

| Preset | Model | Rules | Skills |
|--------|-------|-------|--------|
| `api` | sonnet | core-coding, coding, backend, testing | git, http-analyzer, database, research |
| `frontend` | sonnet | core-coding, coding, frontend, testing | git, browser, research |
| `fullstack` | sonnet | core-coding, coding, frontend, backend, testing | git, http-analyzer, database, browser, research |
| `research` | haiku | core-coding, research | research, translate, prompt-improver, code-research |

### Custom Agent Config

Create your own preset as `agents/<name>.json`:

```json
{
  "name": "my-agent",
  "description": "What this agent does",
  "model": "sonnet",
  "rules": [
    "rules/core-coding.md",
    "rules/roles/coding.md",
    "rules/contexts/backend.md"
  ],
  "skills": [
    "git",
    "database"
  ]
}
```

Then install it: `npx agents-core use my-agent`

## Quick Install

Platform is auto-detected from existing project files. Override with `--platform`.

```bash
# Auto-detect platform, coding role
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash

# Explicit platform + role + context
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash -s -- --platform codex --role coding --context backend

# Global install
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash -s -- --global
```

### Platform Targets

| Platform | Flag | Rules destination | Skills destination |
|----------|------|-------------------|--------------------|
| Claude Code | `--platform claude` | `CLAUDE.md` | `.claude/skills/` |
| OpenAI Codex | `--platform codex` | `AGENTS.md` | `.codex/skills/` |
| Cursor | `--platform cursor` | `.cursor/rules/*.mdc` | `.vscode/skills/` |
| GitHub Copilot | `--platform copilot` | `.github/copilot-instructions.md` | `.vscode/skills/` |

Auto-detection order: looks for `CLAUDE.md`/`.claude` → `AGENTS.md`/`.codex` → `.cursor/` → `.github/copilot-instructions.md` → defaults to `claude`.

### Roles
| Value | Description |
|-------|-------------|
| `coding` | Write, modify, and review code (default) |
| `research` | Find, synthesize, and cite information |
| `planning` | Break goals into actionable tasks |
| `review` | Review code, docs, or plans and give feedback |

### Contexts
| Value | Description |
|-------|-------------|
| `frontend` | UI, components, accessibility |
| `backend` | APIs, validation, databases |
| `devops` | Infrastructure, CI/CD, monitoring |
| `data` | Pipelines, ingestion, transformation |
| `testing` | Test philosophy, pyramid, conventions |

## Skills

Each skill lives in `skills/<name>/SKILL.md` — a single self-contained file with YAML frontmatter and instructions, following the [open agent skills standard](https://agentskills.io/specification). Skills are cross-platform and work with Claude Code, Codex, Cursor, Copilot, and any other agent that supports the standard.

### Install via skills.sh

```bash
# Install all skills from this repo
npx skills add rbk/agents-core

# Install a specific skill
npx skills add rbk/agents-core --skill git
npx skills add rbk/agents-core --skill research

# Install to a specific agent only
npx skills add rbk/agents-core --skill git -a claude-code
```

### Install via agents-core CLI

```bash
# Install with an agent preset (also installs matching skills)
npx agents-core use axiom

# Print a skill's instructions
npx agents-core skill git
```

### Available Skills

| Skill | Description |
|-------|-------------|
| `browser` | Headless browser via Browserless or local Playwright |
| `code-research` | Look up latest docs, cache locally for reuse |
| `database` | DB connection, ORM setup, migrations |
| `git` | Branch, commit, push, PR, and review workflows |
| `hooks` | Create, enable, disable, and test Claude Code hooks |
| `http-analyzer` | Convert curl/HTTP requests to reusable JS modules |
| `list-models` | List available Claude models from the API |
| `prompt-improver` | Refine prompts via Anthropic SDK before use |
| `research` | Brave Search API — web search with cited results |
| `skill-builder` | Create new agent skills from natural language |
| `translate` | Translate content between languages |

Skills are discovered and loaded on demand — agents read the `name` and `description` at startup (~100 tokens each) and only load the full instructions when the skill is relevant.

## Core Coding Rules (`alwaysApply: true`)

Always active regardless of role or context:

1. Small, reusable functions
2. Always write tests
3. Prefer modern libraries over custom implementations
4. Organize utilities
5. Check before you write — don't duplicate existing code
6. Always flag security design flaws and offer fixes

## Structure

```
agents/
  axiom.json           <- [api] Node.js + Express + Postgres production API
  api.json
  frontend.json
  fullstack.json
  research.json
rules/
  core-coding.md       <- alwaysApply: true
  roles/
    coding.md
    research.md
    planning.md
    review.md
  contexts/            <- domain context (platform-agnostic)
    frontend.md
    backend.md
    devops.md
    data.md
    testing.md
  stacks/              <- opinionated tech-stack rules
    node-express-postgres.md
skills/
  browser/SKILL.md
  code-research/SKILL.md
  database/SKILL.md
  git/SKILL.md
  hooks/SKILL.md
  http-analyzer/SKILL.md
  list-models/SKILL.md
  prompt-improver/SKILL.md
  research/SKILL.md
  skill-builder/SKILL.md
  translate/SKILL.md
scripts/
  install.sh
```
