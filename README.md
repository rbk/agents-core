# agents-core

Shared coding rules for AI coding agents (Claude Code, Cursor, GitHub Copilot, etc.).

## Rules

| File | Purpose |
|------|---------|
| `rules/core.md` | Universal rules — applied to all projects and all agents |
| `rules/claude.md` | Claude Code-specific additions |
| `rules/cursor.md` | Cursor-specific additions |
| `rules/copilot.md` | GitHub Copilot-specific additions |

## Quick Install

### Global (Claude Code only — applies to every project)

```bash
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash
```

### Per-project (all agents)

Run from your project root:

```bash
curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash -s -- --project
```

This writes to:
- `./CLAUDE.md` — Claude Code
- `./.cursor/rules/` — Cursor
- `./.github/copilot-instructions.md` — GitHub Copilot

## Core Rules

1. **Small, reusable functions** — single responsibility, extract repeated logic into helpers
2. **Always write tests** — every new function needs corresponding tests
3. **Prefer modern libraries** — don't reimplement what a well-maintained library already does
4. **Organize utilities** — shared helpers go in `lib/` or `utils/`, not scattered across files
5. **Check before you write** — search the codebase first; reuse existing code rather than duplicating
