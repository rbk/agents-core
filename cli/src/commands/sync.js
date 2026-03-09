import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { readManifest, writeManifest, checksum } from '../utils/manifest.js';
import { fetchRule } from '../utils/fetch-rule.js';
import { reapplyPlatformConfig } from '../utils/install-rules.js';

function localChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

export async function sync() {
  const manifest = readManifest();
  if (!manifest) {
    console.error('No .agents/manifest.json found. Run "agents use <name>" first.');
    process.exit(1);
  }

  console.log(`\nAgent:    ${manifest.agent ?? '(manual setup)'}`);
  console.log(`Platform: ${manifest.platform}`);
  console.log(`Syncing .agents/rules/ with remote\n`);

  let anyUpdated = false;

  for (const rule of manifest.rules) {
    const baseName = path.basename(rule.local);
    const localContent = fs.existsSync(rule.local)
      ? fs.readFileSync(rule.local, 'utf8')
      : null;

    const remoteContent = await fetchRule(rule.source);
    const remoteHash = localChecksum(remoteContent);
    const localHash = localContent ? localChecksum(localContent) : null;

    const localModified = localHash !== rule.checksum;
    const remoteChanged = remoteHash !== rule.checksum;

    if (!remoteChanged) {
      const status = localModified ? 'local edits kept' : 'up to date';
      console.log(`  ${baseName.padEnd(32)} ${status}`);
      continue;
    }

    if (localModified) {
      // Both changed — don't overwrite, warn the user
      console.log(`  ${baseName.padEnd(32)} CONFLICT — remote updated but you have local edits`);
      console.log(`    Remote: ${rule.source}`);
      console.log(`    Local:  ${rule.local}`);
      console.log(`    Review manually or delete your local copy and re-run sync.`);
      continue;
    }

    // Remote changed, local untouched — safe to update
    fs.writeFileSync(rule.local, remoteContent);
    rule.checksum = remoteHash;
    anyUpdated = true;
    console.log(`  ${baseName.padEnd(32)} updated`);
  }

  if (anyUpdated) {
    // Update manifest checksums and re-apply platform config
    manifest.installedAt = new Date().toISOString();
    writeManifest(manifest);

    const rulePaths = manifest.rules.map(r => r.source);
    const { dest, action } = reapplyPlatformConfig(rulePaths, manifest.platform, false);
    console.log(`\nRe-applied -> ${dest} (${action})`);
  }

  console.log('\nDone.');
}
