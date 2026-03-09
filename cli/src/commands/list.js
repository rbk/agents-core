const DATA = {
  agents: [
    { name: 'axiom',      desc: '[api]       production API — Node.js, Express, PostgreSQL, JWT' },
    { name: 'api',        desc: '[api]       generic backend API — REST, auth, validation, databases' },
    { name: 'frontend',   desc: '[frontend]  UI components, accessibility, state, data fetching' },
    { name: 'fullstack',  desc: '[fullstack] frontend + backend + database + deployment' },
    { name: 'research',   desc: '[research]  web search, synthesis, citations' },
  ],
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
    { name: 'testing',  desc: 'test philosophy, pyramid, conventions' },
  ],
  stacks: [
    { name: 'node-express-postgres', desc: 'Node.js 22 + Express 5 + PostgreSQL — production API' },
    { name: 'docker-traefik',        desc: 'Docker + Docker Compose + Traefik — containerized deployment' },
  ],
  skills: [
    { name: 'browser',         desc: 'headless browser via Browserless or Playwright' },
    { name: 'code-research',   desc: 'look up latest docs, cache locally for reuse' },
    { name: 'database',        desc: 'DB connection, ORM setup, migrations' },
    { name: 'git',             desc: 'branch, push, PR, and review workflows' },
    { name: 'hooks',           desc: 'create, enable, disable, and test Claude Code hooks' },
    { name: 'http-analyzer',   desc: 'convert curl/HTTP requests to reusable JS modules' },
    { name: 'list-models',     desc: 'list available Claude models from the API' },
    { name: 'prompt-improver', desc: 'refine prompts via Anthropic SDK before use' },
    { name: 'research',        desc: 'Brave Search API — web search with citations' },
    { name: 'skill-builder',   desc: 'create new agent skills from natural language' },
    { name: 'translate',       desc: 'translate content between languages' },
  ],
};

export function list(type) {
  const types = ['agents', 'roles', 'contexts', 'stacks', 'skills'];
  if (!type || !types.includes(type)) {
    console.log('Usage: agents list <agents|roles|contexts|stacks|skills>');
    return;
  }
  console.log(`\n${type}:`);
  for (const item of DATA[type]) {
    console.log(`  ${item.name.padEnd(16)} ${item.desc}`);
  }
  console.log('');
}
