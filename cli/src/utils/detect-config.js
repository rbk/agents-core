import fs from 'fs';
import path from 'path';
import os from 'os';

export function detectConfig(global = false) {
  if (global) return path.join(os.homedir(), '.claude', 'CLAUDE.md');
  if (fs.existsSync('CLAUDE.md')) return 'CLAUDE.md';
  if (fs.existsSync('.cursorrules')) return '.cursorrules';
  if (fs.existsSync('.github/copilot-instructions.md')) return '.github/copilot-instructions.md';
  return 'CLAUDE.md';
}
