---
name: translate
description: Translates content from one language to another using the Anthropic SDK. Invoke this skill when the user wants to translate text, or when another skill (like research) needs content translated to English.
metadata:
  version: "1.0.0"
---

# Translate Skill

Translate content between languages using the Anthropic SDK.

## What This Skill Does

1. Accepts text and a target language (defaults to English)
2. Detects the source language
3. Translates the content while preserving formatting and meaning
4. Returns both the translation and detected source language

## Steps

1. Take the input text and target language from the user (or calling skill)
2. Run `node skills/translate/scripts/translate.js "<text>" "<target-language>"`
3. Return the translated text and detected source language

## Script

Create `skills/translate/scripts/translate.js` if it doesn't exist:

```js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()
const text = process.argv[2]
const targetLang = process.argv[3] || 'English'

if (!text) {
  console.error('Usage: node translate.js "<text>" [target-language]')
  process.exit(1)
}

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content: `Translate the following text to ${targetLang}. Return ONLY the translation, no explanation. Preserve the original formatting.\n\n${text}`,
    },
  ],
})

console.log(response.content[0].text)
```

## Rules

- Default target language is English
- Preserve original formatting (markdown, line breaks, lists)
- For large content, process in chunks to avoid token limits
- Used by the **research** skill for non-English sources
- Requires `ANTHROPIC_API_KEY` in the environment
