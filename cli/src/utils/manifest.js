import fs from 'fs';
import crypto from 'crypto';

export const MANIFEST_PATH = '.agents/manifest.json';
export const RULES_DIR = '.agents/rules';

export function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

export function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

export function writeManifest(data) {
  fs.mkdirSync('.agents', { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2));
}
