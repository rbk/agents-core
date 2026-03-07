#!/usr/bin/env bash
# install.sh — Import agents-core rules into a project or globally
#
# Usage:
#   ./scripts/install.sh            # install globally (Claude Code)
#   ./scripts/install.sh --project  # install into current project directory

set -e

REPO="https://raw.githubusercontent.com/rbk/agents-core/main/rules"
MODE="global"

if [[ "$1" == "--project" ]]; then
  MODE="project"
fi

append_rules() {
  local src="$1"
  local dest="$2"
  local content
  content=$(curl -fsSL "$src")

  if [[ -f "$dest" ]]; then
    echo "Appending to $dest"
    echo "" >> "$dest"
    echo "$content" >> "$dest"
  else
    echo "Creating $dest"
    mkdir -p "$(dirname "$dest")"
    echo "$content" > "$dest"
  fi
}

if [[ "$MODE" == "global" ]]; then
  echo "Installing global Claude Code rules -> ~/.claude/CLAUDE.md"
  append_rules "$REPO/core.md" "$HOME/.claude/CLAUDE.md"
  append_rules "$REPO/claude.md" "$HOME/.claude/CLAUDE.md"
  echo ""
  echo "Done. Rules are now active for all Claude Code projects."

elif [[ "$MODE" == "project" ]]; then
  echo "Installing project-level rules..."

  # Claude Code
  append_rules "$REPO/core.md" "./CLAUDE.md"
  append_rules "$REPO/claude.md" "./CLAUDE.md"
  echo "  -> CLAUDE.md"

  # Cursor
  mkdir -p .cursor/rules
  append_rules "$REPO/core.md" "./.cursor/rules/core.md"
  append_rules "$REPO/cursor.md" "./.cursor/rules/cursor.md"
  echo "  -> .cursor/rules/"

  # GitHub Copilot
  mkdir -p .github
  append_rules "$REPO/core.md" "./.github/copilot-instructions.md"
  append_rules "$REPO/copilot.md" "./.github/copilot-instructions.md"
  echo "  -> .github/copilot-instructions.md"

  echo ""
  echo "Done. Rules installed for Claude Code, Cursor, and GitHub Copilot."
fi
