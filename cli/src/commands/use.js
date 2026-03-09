import { fetchRule } from '../utils/fetch-rule.js';
import { detectPlatform, rulesTarget } from '../utils/detect-platform.js';
import { installRules, installSkill } from '../utils/install-rules.js';
import { PLATFORMS } from '../utils/platforms.js';

export async function use(name, { global: isGlobal, platform: platformFlag } = {}) {
  let config;
  try {
    const json = await fetchRule(`agents/${name}.json`);
    config = JSON.parse(json);
  } catch {
    console.error(`Agent not found: ${name}`);
    console.error('Run "agents list agents" to see available agents.');
    process.exit(1);
  }

  const platform = detectPlatform(platformFlag);
  const p = PLATFORMS[platform];

  console.log(`\nAgent:    ${config.name}`);
  console.log(`Platform: ${p.label}`);
  console.log(`${config.description}`);
  if (config.model) console.log(`Model:    ${config.model}`);
  console.log('');

  // Fetch all rules then install as one marked section
  process.stdout.write('  Fetching rules... ');
  const rawContents = await Promise.all(config.rules.map(r => fetchRule(r)));
  const { dest, action } = installRules(config.rules, rawContents, platform, isGlobal, config.name);
  console.log(`${action} -> ${dest}`);

  // Install skills
  if (config.skills?.length) {
    console.log('');
    for (const skillName of config.skills) {
      process.stdout.write(`  skill ${skillName}... `);
      const skillContent = await fetchRule(`skills/${skillName}/SKILL.md`);
      const skillDest = installSkill(skillName, skillContent, platform);
      console.log(`-> ${skillDest}`);
    }
  }

  // Print MCP server recommendations
  if (config.mcpServers?.length) {
    console.log('\nRecommended MCP servers:');
    for (const mcp of config.mcpServers) {
      console.log(`  ${mcp.name.padEnd(16)} ${mcp.description}`);
      console.log(`  ${''.padEnd(16)} ${mcp.install}`);
    }
  }

  console.log('\nDone.');
}
