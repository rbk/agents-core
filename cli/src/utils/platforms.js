import os from 'os';
import path from 'path';

// Per-platform behavior for rules and skills installation
export const PLATFORMS = {
  claude: {
    label: 'Claude Code',
    rulesFile: 'CLAUDE.md',
    globalRulesFile: path.join(os.homedir(), '.claude', 'CLAUDE.md'),
    skillsDir: '.claude/skills',
    rulesMode: 'append',     // all rules appended to one file
    stripFrontmatter: false, // Claude Code reads YAML frontmatter natively
  },
  codex: {
    label: 'OpenAI Codex',
    rulesFile: 'AGENTS.md',
    globalRulesFile: path.join(os.homedir(), '.codex', 'AGENTS.md'),
    skillsDir: '.codex/skills',
    rulesMode: 'append',
    stripFrontmatter: true,  // AGENTS.md is plain markdown, no frontmatter
  },
  cursor: {
    label: 'Cursor',
    rulesDir: '.cursor/rules',  // one .mdc file per rule
    skillsDir: '.vscode/skills',
    rulesMode: 'files',         // each rule → separate .mdc file
    stripFrontmatter: false,    // Cursor .mdc supports alwaysApply frontmatter
  },
  copilot: {
    label: 'GitHub Copilot',
    rulesFile: '.github/copilot-instructions.md',
    skillsDir: '.vscode/skills',
    rulesMode: 'append',
    stripFrontmatter: true,  // copilot-instructions.md is plain markdown
  },
};

export const PLATFORM_NAMES = Object.keys(PLATFORMS);
