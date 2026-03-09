# Agent Skill & Rule Formats — Research (March 2026)

This document tracks the current standards for skill and rule definitions across major AI agent platforms. The goal is
to keep agents-core aligned with the emerging cross-platform standard.

---

## TL;DR

A cross-platform `SKILL.md` open standard has emerged, originated by Anthropic and adopted by OpenAI (Codex),
Microsoft (VS Code/Copilot), Cursor, GitHub, and others. The format is simple: a directory with a `SKILL.md` file
containing YAML frontmatter + markdown instructions. Skills.sh (by Vercel) is the community package registry.

**Subagents** are a separate Claude Code concept — `.md` files in `.claude/agents/` that define specialized agents with
their own model, tools, permissions, and memory.

---

## 1. Open Agent Skills Standard (agentskills.io)

**Source:** https://agentskills.io/specification

Originated by Anthropic (late 2025), formally adopted by OpenAI, Microsoft, Cursor, GitHub, Atlassian, Figma, and others
within weeks. Follows the same open-standard playbook as MCP.

### Directory Structure

```
skill-name/
├── SKILL.md        # Required
├── scripts/        # Optional: Python, Bash, JS scripts
├── references/     # Optional: reference docs (REFERENCE.md, FORMS.md, etc.)
└── assets/         # Optional: templates, images, data files
```

### SKILL.md Format

```yaml
---
name: skill-name           # Required. Max 64 chars. Lowercase letters, numbers, hyphens only.
description: What it does and when to use it.  # Required. Max 1024 chars.
license: Apache-2.0        # Optional
compatibility: Requires git and internet access  # Optional. Max 500 chars.
allowed-tools: Bash Read   # Optional, experimental. Space-delimited.
metadata: # Optional. Arbitrary key-value pairs.
  author: example-org
  version: "1.0"
---

# Skill Name

[ Instructions, examples, guidelines — no restrictions on markdown format ]
```

### Field Rules

| Field           | Required | Constraints                                                                                                  |
|-----------------|----------|--------------------------------------------------------------------------------------------------------------|
| `name`          | Yes      | 1–64 chars, lowercase alphanum + hyphens, no leading/trailing/consecutive hyphens, must match directory name |
| `description`   | Yes      | 1–1024 chars, describe what it does AND when to use it                                                       |
| `license`       | No       | License name or bundled file reference                                                                       |
| `compatibility` | No       | 1–500 chars, environment requirements                                                                        |
| `allowed-tools` | No       | Space-delimited, experimental                                                                                |
| `metadata`      | No       | String key-value map                                                                                         |

### Progressive Disclosure (3 levels)

1. **~100 tokens** — `name` + `description` loaded at startup for all skills
2. **< 5000 tokens recommended** — full `SKILL.md` body loaded when skill is activated
3. **On demand** — `scripts/`, `references/`, `assets/` files loaded only when needed

### Best Practices

- Keep `SKILL.md` under 500 lines; split detail into `references/`
- Description must describe *what* and *when* — agents use this for auto-routing
- Reference other files with relative paths from skill root
- Scripts should be self-contained with helpful error messages
- Keep individual reference files focused (agents load on demand)

### Installation Paths

| Scope                 | Path                |
|-----------------------|---------------------|
| User (Claude Code)    | `~/.claude/skills/` |
| Project (Claude Code) | `.claude/skills/`   |
| User (Codex)          | `~/.codex/skills/`  |
| Project (Codex)       | `.codex/skills/`    |
| VS Code               | `.vscode/skills/`   |

### Package Registry

**skills.sh** (by Vercel, launched Jan 20 2026) — central directory and leaderboard for agent skill packages. Over
26,000 installs within weeks of launch.

---

## 2. Claude Code — Subagents

**Source:** https://code.claude.com/docs/en/sub-agents

Subagents are a Claude Code-specific concept (not part of the cross-platform skill standard). They run in their own
context window with custom system prompts, model selection, tool access, and permissions.

### File Locations

| Location                 | Scope                | Priority           |
|--------------------------|----------------------|--------------------|
| `.claude/agents/*.md`    | Current project      | 2 (after CLI flag) |
| `~/.claude/agents/*.md`  | All projects         | 3                  |
| CLI `--agents` JSON flag | Session only         | 1 (highest)        |
| Plugin `agents/` dir     | Where plugin enabled | 4 (lowest)         |

### Subagent File Format

```markdown
---
name: code-reviewer                # Required. Lowercase letters and hyphens.
description: Reviews code for quality and best practices  # Required. Controls when Claude delegates.
tools: Read, Glob, Grep            # Optional. Inherits all if omitted.
disallowedTools: Write, Edit       # Optional. Deny list.
model: sonnet                      # Optional. sonnet | opus | haiku | inherit. Default: inherit.
permissionMode: default            # Optional. default | acceptEdits | dontAsk | bypassPermissions | plan
maxTurns: 10                       # Optional. Max agentic turns.
skills:                            # Optional. Skills injected into context at startup.
  - api-conventions
  - error-handling-patterns
mcpServers:                        # Optional. MCP servers available to this subagent.
  - slack
memory: user                       # Optional. user | project | local. Enables cross-session learning.
background: false                  # Optional. true = always run as background task.
isolation: worktree                # Optional. Runs in isolated git worktree.
hooks:                             # Optional. Lifecycle hooks scoped to this subagent.
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

### Key Behaviors

- Subagents **cannot spawn other subagents** (no nesting)
- Subagents do **not inherit parent conversation history** — they start fresh
- Subagents do **not inherit skills** from parent — must be listed explicitly in `skills:`
- Background subagents run concurrently; foreground block until complete
- Memory via `memory:` field gives subagent a persistent `MEMORY.md` (first 200 lines loaded at startup)
- Subagents can be resumed by ID (stored in `~/.claude/projects/{project}/{sessionId}/subagents/`)

### Agent Teams (Experimental, v2.1.32+)

Agent Teams extend subagents with peer-to-peer messaging and parallel sessions. Enable via
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Requires Opus 4.6. Use when you need collaboration, not just parallel
execution.

---

## 3. Claude Code — CLAUDE.md Rules

**Source:** Search results and docs

`CLAUDE.md` is the always-on project context file. Loaded at the start of every session.

### Rule Format

Rules use YAML frontmatter with `alwaysApply: true` for rules that should always be active:

```markdown
---
alwaysApply: true
---

# Rule Name

[Markdown instructions]
```

### Mental Model: CLAUDE.md vs Skills vs Subagents

| Concept     | When to use                              |
|-------------|------------------------------------------|
| `CLAUDE.md` | Rules that apply to nearly every task    |
| Skills      | Reusable workflows invoked on demand     |
| Subagents   | Isolated context for heavy/parallel work |

---

## 4. OpenAI Codex CLI — AGENTS.md & Rules

**Source:** https://developers.openai.com/codex/guides/agents-md

### AGENTS.md — Custom Instructions

```
~/.codex/AGENTS.md          # Global (or AGENTS.override.md for override)
<repo-root>/AGENTS.md       # Project
<sub-dir>/AGENTS.md         # Directory-level override
```

Discovery is root-to-leaf: global → repo root → nested dirs. Files are concatenated with blank lines. Size cap: 32 KiB (
`project_doc_max_bytes`). Injected as user-role messages near top of conversation history.

### Codex Skills

Same cross-platform `SKILL.md` format. Installed at:

- `~/.codex/skills/` (user)
- `.codex/skills/` (project)

### .rules Files — Command Execution Control

```
~/.codex/rules/default.rules
```

Controls which shell commands Codex can run without approval:

```yaml
- pattern: [ "git", [ "status", "diff", "log" ] ]
  decision: allow
  justification: Read-only git operations are safe
```

---

## 5. Cursor — .cursor/rules/*.mdc

**Source:** https://cursor.com/docs/context/rules

### File Locations

| Format         | Status                     | Location                |
|----------------|----------------------------|-------------------------|
| `.cursorrules` | Deprecated but still works | Project root            |
| `.mdc` files   | Current standard           | `.cursor/rules/`        |
| User rules     | All projects               | Cursor Settings > Rules |

### MDC Format

```markdown
---
description: When to apply this rule
globs: "src/**/*.ts"      # Auto-attach to matching files
alwaysApply: false
---

[Rule instructions in markdown]
```

Rule types:

- **Always** — applied to every request
- **Auto Attached** — applied when matched files are in context
- **Agent Requested** — Claude decides when to include
- **Manual** — included only when explicitly referenced with `@ruleName`

### Best Practices

- Keep rules **under 500 lines**
- Use glob patterns for file-specific rules
- Include reasoning behind conventions (not just what, but why)
- Rules are evaluated in priority order: manual > auto-attached > always

---

## 6. GitHub Copilot / VS Code — copilot-instructions.md

**Source:** https://code.visualstudio.com/docs/copilot/customization/custom-instructions

### File Locations (layered)

| File                              | Purpose                                | Scope                 |
|-----------------------------------|----------------------------------------|-----------------------|
| `.github/copilot-instructions.md` | Project-wide coding standards          | Always-on             |
| `*.instructions.md`               | File/language/framework-specific rules | Scoped with `applyTo` |
| `.github/agents/<name>.agent.md`  | Custom agent definitions               | Agent-specific        |
| `AGENTS.md`                       | Multi-agent workspace conventions      | Shared                |

### .github/copilot-instructions.md Format

Plain markdown, no frontmatter required. Natural language instructions. Auto-attached to all chat requests in the
workspace.

```markdown
# Project Instructions

- Use TypeScript strict mode
- Prefer date-fns over moment.js (moment is deprecated)
- All API routes must validate with zod
```

Use `/init` in chat to auto-generate from existing codebase.

### Agent Skills in VS Code (New in v1.108, Dec 2025)

Same cross-platform `SKILL.md` format. Installed in `.vscode/skills/`.

---

## 7. Implications for agents-core

### What we already have that aligns

- `skills/<name>/SKILL.md` with YAML frontmatter — correct format
- `name` and `description` as required fields — correct
- `rules/` directory with markdown files — correct approach
- `alwaysApply: true` frontmatter on core-coding.md — correct

### What needs updating

1. **Validate `name` field** — must match directory name exactly. Some skills may have mismatches.
2. **Add `compatibility` field** to skills that require specific tools (e.g., `code-research` needs internet, `git`
   needs git installed).
3. **Add `metadata.version`** — currently using `version` at top level, spec puts it under `metadata`.
4. **Consider adding `scripts/` and `references/`** directories to complex skills instead of putting everything in
   `SKILL.md`.
5. **Subagents** — we have no `.claude/agents/` definitions yet. These would be the next addition for agents-core:
   pre-built subagent templates (code-reviewer, researcher, etc.).
6. **Cursor** — consider adding `.cursor/rules/` as an install target alongside `.cursorrules`.

### Spec compliance check (current skills)

| Field           | Spec                       | Our current state                  |
|-----------------|----------------------------|------------------------------------|
| `name`          | Required, matches dir name | Present, need to verify naming     |
| `description`   | Required, max 1024 chars   | Present                            |
| `version`       | Under `metadata.version`   | Currently top-level — needs moving |
| `allowed-tools` | Optional, space-delimited  | Not used yet                       |
| `compatibility` | Optional                   | Not used yet                       |
| `license`       | Optional                   | Not included                       |

---

## Sources

- [agentskills.io specification](https://agentskills.io/specification)
- [Claude Code sub-agents docs](https://code.claude.com/docs/en/sub-agents)
- [Anthropic: Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Claude API: Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [OpenAI Codex: AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [OpenAI Codex: Agent Skills](https://developers.openai.com/codex/skills/)
- [Cursor Rules docs](https://cursor.com/docs/context/rules)
- [VS Code Copilot custom instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Agent Skills in VS Code (Visual Studio Magazine)](https://visualstudiomagazine.com/articles/2026/01/11/hand-on-with-new-github-copilot-agent-skills-in-vs-code.aspx)
- [skills.sh package registry](https://skills.sh)
- [Simon Willison: Agent Skills](https://simonwillison.net/2025/Dec/19/agent-skills/)
- [awesome-agent-skills (GitHub)](https://github.com/skillmatic-ai/awesome-agent-skills)
- [Claude Code agent teams (Medium)](https://cobusgreyling.medium.com/claude-code-agent-teams-ca3ec5f2d26a)
