---
name: list-models
description: Lists all available Claude models from the Anthropic API. Invoke this skill when the user asks which Claude models are available, what models can be used with the CLI, or wants to see the current model list.
metadata:
  version: "1.0.0"
---

# List Models Skill

Fetch and display all available Claude models from the Anthropic API.

## What This Skill Does

Calls `GET /v1/models` on the Anthropic API and returns a formatted list of available models with their IDs and display names.

## Steps

1. Run the script at `requests/listModels.js` using `node requests/listModels.js`
2. If the script doesn't exist yet, create it first (see template below)
3. Display the results in a readable table format

## Script Template

Create `requests/listModels.js` if it doesn't exist:

```js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var

const { data: models } = await client.models.list({ limit: 100 });

console.log('\nAvailable Claude Models:\n');
console.log('ID'.padEnd(40) + 'Display Name');
console.log('-'.repeat(70));
for (const model of models) {
  console.log(model.id.padEnd(40) + model.display_name);
}
console.log(`\nTotal: ${models.length} models`);
```

## CLI Usage

Models can be used with the `--model` flag:

```bash
# Use a full model ID
claude --model claude-sonnet-4-6 "your prompt"

# Use an alias
claude --model sonnet "your prompt"
claude --model opus "your prompt"
claude --model haiku "your prompt"
```

## Known Model Aliases (Claude CLI)

| Alias   | Resolves To              |
|---------|--------------------------|
| `opus`  | claude-opus-4-6          |
| `sonnet`| claude-sonnet-4-6        |
| `haiku` | claude-haiku-4-5-20251001|
