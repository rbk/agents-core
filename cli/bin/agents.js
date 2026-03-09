#!/usr/bin/env node
import { program } from 'commander';
import { setup } from '../src/commands/setup.js';
import { skill } from '../src/commands/skill.js';
import { list } from '../src/commands/list.js';
import { use } from '../src/commands/use.js';
import { diff } from '../src/commands/diff.js';
import { sync } from '../src/commands/sync.js';

program
  .name('agents')
  .description('Portable rules and skills for AI coding agents')
  .version('0.1.0');

program
  .command('setup')
  .description('Install rules into the current project (or globally)')
  .option('--role <role>', 'role: coding | research | planning | review')
  .option('--context <context>', 'context: frontend | backend | devops | data | testing')
  .option('--platform <platform>', 'platform: claude | codex | cursor | copilot (auto-detected)')
  .option('--global', 'install to global config instead of current project')
  .option('-y, --yes', 'skip interactive prompts, use defaults')
  .action(setup);

program
  .command('skill <name>')
  .description('Print setup instructions for a skill (research | browser | database)')
  .action(skill);

program
  .command('list <type>')
  .description('List available agents, roles, contexts, or skills')
  .action(list);

program
  .command('use <name>')
  .description('Install an agent preset (rules + skills) into the current project')
  .option('--platform <platform>', 'platform: claude | codex | cursor | copilot (auto-detected)')
  .option('--global', 'install rules to global config instead of current project')
  .action(use);

program
  .command('diff')
  .description('Show what changed between your local rules and the remote source')
  .action(diff);

program
  .command('sync')
  .description('Pull remote rule updates into .agents/rules/ (skips locally modified files)')
  .action(sync);

program.parse();
