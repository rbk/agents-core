# Core Coding Rules

These rules apply across all projects and all AI coding agents.

## Rules

- **Small, reusable functions.** Keep functions focused on a single responsibility. Extract repeated logic into named helpers rather than inlining it.
- **Always write tests.** Every new function must have corresponding tests. Use existing test patterns and frameworks in the project.
- **Prefer modern libraries over custom implementations.** Before writing utility code, check if a well-maintained library already solves the problem (e.g. date handling, parsing, validation).
- **Organize utilities.** Place shared helpers in a clearly named utility module (e.g. `lib/`, `utils/`). Don't scatter utility functions across unrelated files.
- **Check before you write.** Before implementing a function, search the codebase to verify it doesn't already exist. Reuse and extend existing code rather than duplicating it.
