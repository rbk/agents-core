import { fetchRule } from '../utils/fetch-rule.js';

const SKILLS = ['research', 'browser', 'database'];

export async function skill(name) {
  if (!name) {
    console.log('Available skills: ' + SKILLS.join(', '));
    console.log('\nUsage: agents skill <name>');
    return;
  }
  if (!SKILLS.includes(name)) {
    console.error(`Unknown skill: ${name}`);
    console.error('Available: ' + SKILLS.join(', '));
    process.exit(1);
  }

  const content = await fetchRule(`skills/${name}/setup.md`);
  console.log(content);
}
