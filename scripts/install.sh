#!/usr/bin/env bash
# install.sh — Install agents-core rules into a project
#
# Defaults to project-level install. Detects which agent config file to use.
#
# Usage:
#   # Quickest — pipe directly into bash:
#   curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash
#
#   # With options:
#   bash install.sh [--role <role>] [--context <context>] [--global]
#
#   --role     coding | research | planning | review  (default: coding)
#   --context  frontend | backend | devops | data     (optional)
#   --global   Install to ~/.claude/CLAUDE.md instead of current project

set -e

BASE="https://raw.githubusercontent.com/rbk/agents-core/main"
ROLE="coding"
CONTEXT=""
GLOBAL=false

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --role)     ROLE="$2";    shift 2 ;;
    --context)  CONTEXT="$2"; shift 2 ;;
    --global)   GLOBAL=true;  shift   ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Detect which config file to use
detect_config() {
  if [[ "$GLOBAL" == true ]]; then
    echo "$HOME/.claude/CLAUDE.md"
  elif [[ -f "CLAUDE.md" ]]; then
    echo "CLAUDE.md"
  elif [[ -f ".cursorrules" ]]; then
    echo ".cursorrules"
  elif [[ -f ".github/copilot-instructions.md" ]]; then
    echo ".github/copilot-instructions.md"
  else
    echo "CLAUDE.md"  # default: create it
  fi
}

append() {
  local url="$1"
  local dest="$2"
  local content
  content=$(curl -fsSL "$url") || { echo "Failed to fetch $url"; exit 1; }
  mkdir -p "$(dirname "$dest")"
  echo "" >> "$dest"
  echo "$content" >> "$dest"
  echo "  + appended: $(basename "$url") -> $dest"
}

CONFIG=$(detect_config)
echo "Installing agents-core rules -> $CONFIG"
echo "  role: $ROLE"
[[ -n "$CONTEXT" ]] && echo "  context: $CONTEXT"
echo ""

# Always apply core coding rules
append "$BASE/rules/core-coding.md" "$CONFIG"

# Role rules
append "$BASE/rules/roles/$ROLE.md" "$CONFIG"

# Context rules (optional)
if [[ -n "$CONTEXT" ]]; then
  append "$BASE/rules/contexts/$CONTEXT.md" "$CONFIG"
fi

echo ""
echo "Done."
