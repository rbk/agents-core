import fs from 'fs';
import path from 'path';
import { readManifest } from '../utils/manifest.js';
import { fetchRule } from '../utils/fetch-rule.js';

function diffLines(a, b) {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const out = [];
  const max = Math.max(aLines.length, bLines.length);
  let changed = false;
  for (let i = 0; i < max; i++) {
    const aLine = aLines[i] ?? '';
    const bLine = bLines[i] ?? '';
    if (aLine !== bLine) {
      out.push(`- ${aLine}`);
      out.push(`+ ${bLine}`);
      changed = true;
    }
  }
  return { changed, lines: out };
}

export async function diff() {
  const manifest = readManifest();
  if (!manifest) {
    console.error('No .agents/manifest.json found. Run "agents use <name>" first.');
    process.exit(1);
  }

  console.log(`\nAgent: ${manifest.agent ?? '(manual setup)'}`);
  console.log(`Diffing local .agents/rules/ against remote\n`);

  let anyChanged = false;

  for (const rule of manifest.rules) {
    const localContent = fs.existsSync(rule.local)
      ? fs.readFileSync(rule.local, 'utf8')
      : null;

    const remoteContent = await fetchRule(rule.source);
    const baseName = path.basename(rule.local);

    // Local vs installed checksum — did the user edit this file?
    const localHash = localContent ? crypto_checksum(localContent) : null;
    const localModified = localHash !== rule.checksum;

    // Local vs remote — did remote change since install?
    const remoteHash = crypto_checksum(remoteContent);
    const remoteChanged = remoteHash !== rule.checksum;

    if (!localModified && !remoteChanged) {
      console.log(`  ${baseName.padEnd(32)} up to date`);
      continue;
    }

    anyChanged = true;
    const tags = [localModified && 'locally modified', remoteChanged && 'remote updated'].filter(Boolean);
    console.log(`  ${baseName.padEnd(32)} ${tags.join(', ')}`);

    if (localModified && localContent) {
      const { lines } = diffLines(remoteContent, localContent);
      for (const line of lines.slice(0, 20)) {
        console.log(`    ${line}`);
      }
      if (lines.length > 20) console.log(`    ... +${lines.length - 20} more lines`);
    }
    console.log('');
  }

  if (!anyChanged) console.log('  Everything is in sync.\n');
}

// Inline checksum to avoid circular import
import crypto from 'crypto';
function crypto_checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}
