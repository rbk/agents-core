import fs from 'fs';
import path from 'path';
import { PLATFORMS } from './platforms.js';
import { rulesTarget } from './detect-platform.js';
import { RULES_DIR, MANIFEST_PATH, checksum, writeManifest } from './manifest.js';

const MARKER_START = '<!-- agents-core -->';
const MARKER_END = '<!-- /agents-core -->';

function stripFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '').trimStart();
}

function ruleBasename(rulePath) {
  return path.basename(rulePath, '.md');
}

// Write content into a marked section of a file, replacing any existing block
function writeMarkedSection(dest, content) {
  fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
  const block = `${MARKER_START}\n${content.trim()}\n${MARKER_END}`;

  if (fs.existsSync(dest)) {
    const existing = fs.readFileSync(dest, 'utf8');
    const start = existing.indexOf(MARKER_START);
    const end = existing.indexOf(MARKER_END);
    if (start !== -1 && end !== -1) {
      fs.writeFileSync(dest, existing.slice(0, start) + block + existing.slice(end + MARKER_END.length));
      return 'updated';
    }
  }
  fs.appendFileSync(dest, '\n\n' + block + '\n');
  return 'appended';
}

// Build platform config from local rule files
function applyPlatformConfig(rulePaths, platform, isGlobal) {
  const p = PLATFORMS[platform];

  if (p.rulesMode === 'files') {
    // Cursor: write one .mdc file per rule from local copies
    fs.mkdirSync(p.rulesDir, { recursive: true });
    for (const rulePath of rulePaths) {
      const localFile = path.join(RULES_DIR, ruleBasename(rulePath) + '.md');
      const raw = fs.readFileSync(localFile, 'utf8');
      const dest = path.join(p.rulesDir, ruleBasename(rulePath) + '.mdc');
      fs.writeFileSync(dest, p.stripFrontmatter ? stripFrontmatter(raw) : raw);
    }
    return { dest: p.rulesDir, action: `wrote ${rulePaths.length} files` };
  }

  // Single-file platforms: combine local files into one marked section
  const combined = rulePaths.map(rulePath => {
    const localFile = path.join(RULES_DIR, ruleBasename(rulePath) + '.md');
    const raw = fs.readFileSync(localFile, 'utf8');
    return p.stripFrontmatter ? stripFrontmatter(raw) : raw;
  }).join('\n\n---\n\n');

  const dest = rulesTarget(platform, isGlobal);
  const action = writeMarkedSection(dest, combined);
  return { dest, action };
}

// Install rules: save to .agents/rules/, write manifest, apply platform config
export function installRules(rulePaths, rawContents, platform, isGlobal, agentName) {
  // Save each rule to .agents/rules/
  fs.mkdirSync(RULES_DIR, { recursive: true });
  const manifestRules = rulePaths.map((rulePath, i) => {
    const raw = rawContents[i];
    const localFile = path.join(RULES_DIR, ruleBasename(rulePath) + '.md');
    fs.writeFileSync(localFile, raw);
    return { source: rulePath, local: localFile, checksum: checksum(raw) };
  });

  // Write manifest
  writeManifest({
    agent: agentName || null,
    platform,
    installedAt: new Date().toISOString(),
    rules: manifestRules,
  });

  // Apply platform config from local files
  return applyPlatformConfig(rulePaths, platform, isGlobal);
}

// Re-apply platform config from existing .agents/rules/ files (used by sync)
export function reapplyPlatformConfig(rulePaths, platform, isGlobal) {
  return applyPlatformConfig(rulePaths, platform, isGlobal);
}

// Install a skill into the platform's skills directory
export function installSkill(skillName, skillContent, platform) {
  const p = PLATFORMS[platform];
  const skillDir = path.join(p.skillsDir, skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);
  return skillDir;
}
