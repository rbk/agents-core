import fs from 'fs';
import path from 'path';
import { select } from '@inquirer/prompts';
import { detectConfig } from '../utils/detect-config.js';
import { fetchRule } from '../utils/fetch-rule.js';

const ROLES = ['coding', 'research', 'planning', 'review'];
const CONTEXTS = ['none', 'frontend', 'backend', 'devops', 'data'];

export async function setup({ role, context, global: isGlobal, yes }) {
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
        ],
      });
    }
  }

  selectedRole = selectedRole || 'coding';
  const config = detectConfig(isGlobal);

  console.log(`\nInstalling rules -> ${config}`);

  const toFetch = [
    `rules/core-coding.md`,
    `rules/roles/${selectedRole}.md`,
    ...(selectedContext ? [`rules/contexts/${selectedContext}.md`] : []),
  ];

  for (const rulePath of toFetch) {
    process.stdout.write(`  fetching ${rulePath}... `);
    const content = await fetchRule(rulePath);
    fs.mkdirSync(path.dirname(config), { recursive: true });
    fs.appendFileSync(config, '\n' + content + '\n');
    console.log('done');
  }

  console.log('\nDone.');
}
