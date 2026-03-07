const DATA = {
  roles: [
    { name: 'coding',   desc: 'write, modify, and review code' },
    { name: 'research', desc: 'find, synthesize, and cite information' },
    { name: 'planning', desc: 'break goals into actionable tasks' },
    { name: 'review',   desc: 'review code, docs, and plans' },
  ],
  contexts: [
    { name: 'frontend', desc: 'UI, components, accessibility' },
    { name: 'backend',  desc: 'APIs, validation, databases' },
    { name: 'devops',   desc: 'infrastructure, CI/CD, monitoring' },
    { name: 'data',     desc: 'pipelines, ingestion, transformation' },
  ],
  skills: [
    { name: 'research', desc: 'Brave Search API — web search with citations' },
    { name: 'browser',  desc: 'headless browser via Browserless or Playwright' },
    { name: 'database', desc: 'DB connection, ORM setup, migrations' },
  ],
};

export function list(type) {
  const types = ['roles', 'contexts', 'skills'];
  if (!type || !types.includes(type)) {
    console.log('Usage: agents list <roles|contexts|skills>');
    return;
  }
  console.log(`\n${type}:`);
  for (const item of DATA[type]) {
    console.log(`  ${item.name.padEnd(12)} ${item.desc}`);
  }
  console.log('');
}
