---
name: hooks
description: Manages Claude Code hooks — create, enable, disable, test, and reference available hooks. Invoke this skill when the user wants to add a hook, toggle a hook on or off, test a hook, or look up what hooks are available.
metadata:
  version: "1.0.0"
---

# Hooks Skill

Create, enable, disable, and test Claude Code hooks.

## Quick Reference

### Hook Events

| Event | When It Fires | Can Block? | Matcher |
|-------|---------------|------------|---------|
| `SessionStart` | Session begins/resumes/clears/compacts | No | `startup`, `resume`, `clear`, `compact` |
| `SessionEnd` | Session terminates | No | `clear`, `logout`, `prompt_input_exit` |
| `UserPromptSubmit` | User submits a prompt | Yes | None |
| `PreToolUse` | Before a tool executes | Yes | Tool names (`Bash`, `Edit\|Write`) |
| `PostToolUse` | After a tool succeeds | No | Tool names |
| `PostToolUseFailure` | After a tool fails | No | Tool names |
| `PermissionRequest` | Permission dialog appears | Yes | Tool names |
| `Stop` | Claude finishes responding | Yes | None |
| `Notification` | Claude needs input/permission | No | `permission_prompt`, `idle_prompt` |
| `SubagentStart` | Subagent spawned | No | Agent type (`Explore`, `Plan`) |
| `SubagentStop` | Subagent finishes | Yes | Agent type |
| `TaskCompleted` | Task marked complete | Yes | None |
| `TeammateIdle` | Agent team teammate idle | Yes | None |
| `ConfigChange` | Config file changes | Yes | `user_settings`, `project_settings` |
| `PreCompact` | Before context compaction | No | `manual`, `auto` |
| `WorktreeCreate` | Worktree being created | Yes | None |
| `WorktreeRemove` | Worktree being removed | No | None |

### Hook Types

| Type | What It Does | Timeout |
|------|-------------|---------|
| `command` | Runs a shell command or script | 600s |
| `prompt` | Single-turn LLM evaluation | 30s |
| `agent` | Multi-turn verification with tools | 60s |

### Stdin (all hooks receive)

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/dir",
  "hook_event_name": "EventName"
}
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success — action proceeds |
| `2` | Block — action prevented, stderr shown to Claude |
| Other | Non-blocking error — stderr shown in verbose mode only |

## Operations

### Create a Hook

1. Ask the user what event to hook into and what it should do
2. Create the script in `.claude/hooks/<name>.sh` or `.claude/hooks/<name>.js`
3. Make it executable (`chmod +x`)
4. Add the hook config to `.claude/settings.json` under `"hooks"`
5. Test it

Hook config format:
```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<optional regex>",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/<name>.sh"
          }
        ]
      }
    ]
  }
}
```

### Enable a Hook

1. Read `.claude/settings.json`
2. Find the hook by event name or script name
3. If it was disabled (moved to `_disabled_hooks`), move it back to `hooks`
4. Confirm to the user

### Disable a Hook

1. Read `.claude/settings.json`
2. Find the hook by event name or script name
3. Move it from `hooks` to `_disabled_hooks` (preserves config for re-enabling)
4. Confirm to the user

### Test a Hook

1. Find the hook script path from `.claude/settings.json`
2. Craft a sample JSON payload matching the event's stdin schema
3. Pipe it into the script: `echo '<json>' | .claude/hooks/<name>.sh`
4. Show the exit code and stdout/stderr to the user
5. Report pass/fail

### List Hooks

1. Read `.claude/settings.json`
2. Show all active hooks with event, matcher, type, and script path
3. Show all disabled hooks separately

## Rules

- Hook scripts go in `.claude/hooks/` (not in `skills/`)
- Use `$CLAUDE_PROJECT_DIR` for paths in hook configs — keeps them portable
- Prefer `command` type for simple logging/validation
- Use `prompt` or `agent` type only when you need LLM judgment
- Always test a hook after creating it
- Disabled hooks are stored in `_disabled_hooks` so they can be re-enabled without recreating them
- Scripts should be fast — don't block the user's workflow
