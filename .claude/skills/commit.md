---
name: commit
description: Create a clean, conventional git commit with proper staging
---

Review all changes with `git diff` and `git status`, then:

1. Stage only relevant files (avoid .env, secrets, node_modules)
2. Write a commit message following Conventional Commits format:
   - `feat:` new feature
   - `fix:` bug fix
   - `refactor:` code restructure
   - `style:` formatting/naming
   - `chore:` build, deps, config
   - `docs:` documentation
3. Keep subject line under 72 chars, imperative mood
4. Commit and confirm with `git status`

Always check .gitignore is properly excluding .env files before committing.
