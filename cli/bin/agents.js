#!/usr/bin/env node
import { program } from 'commander';
import { setup } from '../src/commands/setup.js';
import { skill } from '../src/commands/skill.js';
import { list } from '../src/commands/list.js';

program
  .name('agents')
  .description('Portable rules and skills for AI coding agents')
  .version('0.1.0');

program
  .command('setup')
  .description('Install rules into the current project (or globally)')
  .option('--role <role>', 'role: coding | research | planning | review')
  .option('--context <context>', 'context: frontend | backend | devops | data')
  .option('--global', 'install to ~/.claude/CLAUDE.md instead of current project')
  .option('-y, --yes', 'skip interactive prompts, use defaults')
  .action(setup);

program
  .command('skill <name>')
  .description('Print setup instructions for a skill (research | browser | database)')
  .action(skill);

program
  .command('list <type>')
  .description('List available roles, contexts, or skills')
  .action(list);

program.parse();
