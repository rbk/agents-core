---
name: prompt-improver
description: Improves and refines prompts before sending them to Claude using the @anthropic-ai/sdk. Invoke this skill when the user wants to optimize, refine, or improve a prompt, or when a prompt needs to be made clearer, more specific, or more effective.
metadata:
  version: "1.0.0"
---

# Prompt Improver

Use the Anthropic SDK to analyze and improve prompts before they are used.

## What This Skill Does

1. Takes a raw prompt from the user
2. Sends it to Claude via `@anthropic-ai/sdk` with meta-instructions to improve it
3. Returns an improved version with better structure, clarity, and specificity

## Steps

1. Read the user's original prompt
2. Run `node skills/prompt-improver/scripts/improve.js "<prompt>"` to get the improved version
3. Present both the original and improved prompt to the user
4. Let the user choose which to use or request further edits

## Script

Create `skills/prompt-improver/scripts/improve.js` if it doesn't exist:

```js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()
const originalPrompt = process.argv[2]

if (!originalPrompt) {
  console.error('Usage: node improve.js "<prompt>"')
  process.exit(1)
}

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: `Improve the following prompt. Make it clearer, more specific, and more effective. Return ONLY the improved prompt, no explanation.\n\nOriginal prompt:\n${originalPrompt}`,
    },
  ],
})

console.log(response.content[0].text)
```

## Rules

- Always show the user both versions (original and improved)
- Never auto-replace — let the user decide
- Use `claude-sonnet-4-6` for the improvement call (fast and capable)
- The script requires `ANTHROPIC_API_KEY` to be set in the environment
