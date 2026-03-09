---
name: git
description: Manages git workflows including committing, creating branches, pulling and pushing code, reviewing PRs, and submitting PRs via GitHub CLI. Invoke this skill when the user says "commit", wants to create a branch, push code, open a pull request, review a PR, or perform any git/GitHub operation.
metadata:
  version: "1.1.0"
---

# Git Skill

Manage git and GitHub workflows from the CLI.

## What This Skill Does

Handles common git and GitHub operations:
- **Commit changes** (the most common operation)
- Create and switch branches
- Stage, commit, and push changes
- Open, review, and merge pull requests
- View PR checks and comments

## Operations

### Commit (triggered by "commit" or "save")
1. Run `git status` to see what changed
2. Run `git diff --stat HEAD` to understand the scope
3. Run `git log --oneline -5` to match the repo's commit message style
4. Stage relevant files by name (not `git add .`)
5. Write a conventional commit message:
   - Prefix: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
   - First line: concise summary of **why**, not what
   - Body (if needed): bullet points of key changes
   - Footer: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
6. Commit and show confirmation

### Create a Feature Branch
```bash
git checkout -b feat/<branch-name>
```
- Branch from `main` unless told otherwise
- Use conventional prefixes: `feat/`, `fix/`, `chore/`, `refactor/`

### Push Code
```bash
git push -u origin <branch-name>
```
- Always set upstream on first push (`-u`)

### Open a Pull Request
```bash
gh pr create --title "<title>" --body "<body>"
```
- Title: short, under 70 chars
- Body: summary bullets + test plan
- Target `main` unless specified otherwise

### Review a PR
```bash
gh pr view <number>
gh pr diff <number>
gh api repos/<owner>/<repo>/pulls/<number>/comments
gh pr checks <number>
```

### Merge a PR
```bash
gh pr merge <number> --squash --delete-branch
```
- Default to squash merge
- Delete the branch after merge

## Rules

- Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Never force push to `main`
- Never skip hooks (`--no-verify`) unless the user explicitly asks
- Always confirm before destructive operations (force push, reset --hard)
- Stage specific files by name — avoid `git add .`
