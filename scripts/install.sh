#!/usr/bin/env bash
# install.sh — Install agents-core rules into a project
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/rbk/agents-core/main/scripts/install.sh | bash
#   bash install.sh [--platform <platform>] [--role <role>] [--context <context>] [--global]
#
#   --platform  claude | codex | cursor | copilot  (auto-detected if omitted)
#   --role      coding | research | planning | review  (default: coding)
#   --context   frontend | backend | devops | data | testing  (optional)
#   --global    Install to global config instead of current project

set -e

BASE="https://raw.githubusercontent.com/rbk/agents-core/main"
ROLE="coding"
CONTEXT=""
GLOBAL=false
PLATFORM=""

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform) PLATFORM="$2"; shift 2 ;;
    --role)     ROLE="$2";     shift 2 ;;
    --context)  CONTEXT="$2";  shift 2 ;;
    --global)   GLOBAL=true;   shift   ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Auto-detect platform if not specified
detect_platform() {
  if [[ -n "$PLATFORM" ]]; then echo "$PLATFORM"; return; fi
  if [[ -f "CLAUDE.md" || -d ".claude" ]]; then echo "claude"; return; fi
  if [[ -f "AGENTS.md" || -d ".codex" ]]; then echo "codex"; return; fi
  if [[ -d ".cursor" ]]; then echo "cursor"; return; fi
  if [[ -f ".github/copilot-instructions.md" ]]; then echo "copilot"; return; fi
  echo "claude"
}

# Resolve destination file/dir for the detected platform
detect_config() {
  local platform="$1"
  if [[ "$GLOBAL" == true ]]; then
    case "$platform" in
      claude)  echo "$HOME/.claude/CLAUDE.md" ;;
      codex)   echo "$HOME/.codex/AGENTS.md" ;;
      cursor)  echo ".cursor/rules" ;;
      copilot) echo ".github/copilot-instructions.md" ;;
    esac
  else
    case "$platform" in
      claude)  echo "CLAUDE.md" ;;
      codex)   echo "AGENTS.md" ;;
      cursor)  echo ".cursor/rules" ;;
      copilot) echo ".github/copilot-instructions.md" ;;
    esac
  fi
}

strip_frontmatter() {
  # Remove YAML frontmatter block (---\n...\n---\n) from content
  sed '/^---$/,/^---$/d'
}

install_rule() {
  local url="$1"
  local platform="$2"
  local dest="$3"
  local content
  content=$(curl -fsSL "$url") || { echo "Failed to fetch $url"; exit 1; }

  if [[ "$platform" == "cursor" ]]; then
    # Write each rule as a separate .mdc file in .cursor/rules/
    local name
    name=$(basename "$url" .md)
    mkdir -p "$dest"
    echo "$content" > "$dest/$name.mdc"
    echo "  + wrote: $dest/$name.mdc"
  elif [[ "$platform" == "codex" || "$platform" == "copilot" ]]; then
    # Strip frontmatter before appending
    mkdir -p "$(dirname "$dest")"
    echo "" >> "$dest"
    echo "$content" | strip_frontmatter >> "$dest"
    echo "  + appended: $(basename "$url") -> $dest"
  else
    # Claude: keep frontmatter, append to single file
    mkdir -p "$(dirname "$dest")"
    echo "" >> "$dest"
    echo "$content" >> "$dest"
    echo "  + appended: $(basename "$url") -> $dest"
  fi
}

DETECTED=$(detect_platform)
CONFIG=$(detect_config "$DETECTED")

echo "Platform: $DETECTED"
echo "Installing rules -> $CONFIG"
echo "  role: $ROLE"
[[ -n "$CONTEXT" ]] && echo "  context: $CONTEXT"
echo ""

install_rule "$BASE/rules/core-coding.md"      "$DETECTED" "$CONFIG"
install_rule "$BASE/rules/roles/$ROLE.md"       "$DETECTED" "$CONFIG"
if [[ -n "$CONTEXT" ]]; then
  install_rule "$BASE/rules/contexts/$CONTEXT.md" "$DETECTED" "$CONFIG"
fi

echo ""
echo "Done."
