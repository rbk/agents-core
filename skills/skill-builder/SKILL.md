---
name: skill-builder
description: Converts natural language descriptions into agent skills with SKILL.md files and supporting JavaScript scripts. Invoke this skill when the user wants to create a new skill, define a new agent capability, or scaffold a skill from a description.
metadata:
  version: "1.0.0"
---

# Skill Builder

Convert natural language descriptions into fully scaffolded agent skills.

## What This Skill Does

1. Takes a natural language description of a desired capability
2. Generates a `SKILL.md` with proper YAML frontmatter and instructions
3. Creates supporting JavaScript scripts in the skill directory
4. Registers the skill in the skills README

## Steps

1. Ask the user to describe what the skill should do
2. Derive a kebab-case skill name from the description
3. Create `skills/<skill-name>/SKILL.md` with:
   - YAML frontmatter: `name`, `description` (used for matching), `version`
   - Clear instructions for what the skill does
   - Input/output format
   - Rules and constraints
   - An example
4. If the skill requires a script, create it in `skills/<skill-name>/scripts/`
5. Update `skills/README.md` to include the new skill in the table

## SKILL.md Template

```markdown
---
name: <kebab-case-name>
description: <One clear sentence. Claude uses this to decide when to invoke the skill.>
metadata:
  version: "1.0.0"
---

# <Skill Title>

<What this skill does in 1-2 sentences.>

## Steps

1. <Step-by-step instructions Claude follows>

## Rules

- <Constraints and conventions>

## Example

**Input:** <example input>
**Output:** <example output>
```

## Rules

- The `description` field in frontmatter is critical — it must clearly state WHEN to invoke the skill
- Keep scripts in `skills/<skill-name>/scripts/` (not in `requests/`)
- Scripts must be ESM (`import`/`export`), not CommonJS
- Each skill should be self-contained — all its files live in its directory
- Skills should be small and single-purpose
