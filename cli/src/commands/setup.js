import { select } from '@inquirer/prompts';
import { fetchRule } from '../utils/fetch-rule.js';
import { detectPlatform, rulesTarget } from '../utils/detect-platform.js';
import { installRules } from '../utils/install-rules.js';
import { PLATFORMS } from '../utils/platforms.js';

export async function setup({ role, context, global: isGlobal, platform: platformFlag, yes }) {
  let selectedRole = role;
  let selectedContext = context;

  if (!yes) {
    if (!selectedRole) {
      selectedRole = await select({
        message: 'Select a role:',
        choices: [
          { value: 'coding',   name: 'coding   — write, modify, and review code' },
          { value: 'research', name: 'research — find, synthesize, and cite information' },
          { value: 'planning', name: 'planning — break goals into actionable tasks' },
          { value: 'review',   name: 'review   — review code, docs, and plans' },
        ],
      });
    }
    if (!selectedContext) {
      selectedContext = await select({
        message: 'Select a context (optional):',
        choices: [
          { value: '',         name: 'none' },
          { value: 'frontend', name: 'frontend — UI, components, accessibility' },
          { value: 'backend',  name: 'backend  — APIs, validation, databases' },
          { value: 'devops',   name: 'devops   — infrastructure, CI/CD, monitoring' },
          { value: 'data',     name: 'data     — pipelines, ingestion, transformation' },
          { value: 'testing',  name: 'testing  — test philosophy, pyramid, conventions' },
        ],
      });
    }
  }

  selectedRole = selectedRole || 'coding';

  const platform = detectPlatform(platformFlag);
  const p = PLATFORMS[platform];

  const rulePaths = [
    'rules/core-coding.md',
    `rules/roles/${selectedRole}.md`,
    ...(selectedContext ? [`rules/contexts/${selectedContext}.md`] : []),
  ];

  const dest = p.rulesMode === 'files' ? p.rulesDir : rulesTarget(platform, isGlobal);

  console.log(`\nPlatform: ${p.label}`);
  console.log(`Installing rules -> ${dest}\n`);

  process.stdout.write('  Fetching rules... ');
  const rawContents = await Promise.all(rulePaths.map(r => fetchRule(r)));
  const { action } = installRules(rulePaths, rawContents, platform, isGlobal);
  console.log(`${action} -> ${dest}`);

  console.log('\nDone.');
}
