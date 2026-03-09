import fs from 'fs';
import { PLATFORMS, PLATFORM_NAMES } from './platforms.js';

// Auto-detect platform from existing project files
export function detectPlatform(explicit) {
  if (explicit) {
    if (!PLATFORM_NAMES.includes(explicit)) {
      console.error(`Unknown platform: ${explicit}`);
      console.error(`Available: ${PLATFORM_NAMES.join(', ')}`);
      process.exit(1);
    }
    return explicit;
  }

  if (fs.existsSync('CLAUDE.md') || fs.existsSync('.claude')) return 'claude';
  if (fs.existsSync('AGENTS.md') || fs.existsSync('.codex')) return 'codex';
  if (fs.existsSync('.cursor')) return 'cursor';
  if (fs.existsSync('.github/copilot-instructions.md')) return 'copilot';

  return 'claude'; // default
}

// Resolve the rules target path for append-mode platforms
export function rulesTarget(platform, isGlobal) {
  const p = PLATFORMS[platform];
  if (isGlobal) return p.globalRulesFile ?? p.rulesFile;
  return p.rulesFile;
}
