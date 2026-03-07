# agents-core

Every AI coding agent starts fresh. It doesn't know how you like to work, what standards you hold, or what skills it has access to. You end up re-explaining the same preferences across every project, every tool, and every conversation.

**agents-core** is a single source of truth for your coding rules and agent skills. Define them once, install them anywhere — Claude Code, Cursor, GitHub Copilot, Codex CLI, or any LLM that reads a project config file. Rules are plain markdown so they're readable by any agent without special tooling.

When you start a new project, one `curl` command installs your rules. When you want your agent to gain a new capability — like web search or database access — you tell it to set up the skill and it follows the instructions itself.

## Concepts

| Concept | Description |
|---------|-------------|
| **Core rules** | `alwaysApply: true` — always active, every project |
| **Roles** | What the agent is doing: coding, research, planning, review |
| **Contexts** | What domain it's working in: frontend, backend, devops, data |
| **Skills** | Additive capabilities an agent can be instructed to set up (research, browser, database) |

## Quick Install

Installs into the project-level config file that's already present (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`). Creates `CLAUDE.md` if none found.

```bash
# Default: coding role, project-level
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash

# With role + context
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash -s -- --role coding --context backend

# Global (Claude Code only, applies to every project)
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash -s -- --global
```

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

## Adding Skills

Tell your agent: *"Set up the research skill"* — it will read `skills/research/setup.md` and follow the instructions (ask for API keys, update `.env`, append rules to your config file).

### Available Skills

| Skill | What it sets up |
|-------|----------------|
| `research` | Brave Search API — web search with cited results |
| `browser` | Headless browser via Browserless or local Playwright |
| `database` | DB connection, ORM setup, migrations |

To add a skill manually, point your agent at the setup file:
```
https://raw.githubusercontent.com/rbk/agents-core/main/skills/<skill>/setup.md
```

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
rules/
  core-coding.md       ← alwaysApply: true
  roles/
    coding.md
    research.md
    planning.md
    review.md
  contexts/
    frontend.md
    backend.md
    devops.md
    data.md
skills/
  research/
    setup.md           ← LLM-readable setup instructions
    rules.md           ← injected into project config when skill is active
  browser/
    setup.md
    rules.md
  database/
    setup.md
    rules.md
scripts/
  install.sh
```
