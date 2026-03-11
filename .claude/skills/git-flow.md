---
name: git-flow
description: Standard Git Flow for feature development, bugfix, and releases
---

## Branch Structure

```
main        — production-ready code only, never commit directly
develop     — integration branch, base for all feature branches
feature/*   — new features (branched from develop)
fix/*       — bug fixes (branched from develop)
hotfix/*    — urgent production fixes (branched from main)
```

## Standard Workflow

### 1. Start a new feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. Work on the feature
- Make small, focused commits using Conventional Commits:
  - `feat: add todo priority field`
  - `fix: correct email validation`
  - `refactor: extract validation middleware`
  - `style: rename variables to English`
  - `chore: update dependencies`

```bash
git add <specific-files>
git commit -m "feat: description of change"
```

### 3. Push and open PR
```bash
git push -u origin feature/your-feature-name
```
Then open a PR on GitHub: `feature/your-feature-name` → `develop`

### 4. PR checklist (fill out PR template)
- [ ] Self-review the diff
- [ ] Tested locally
- [ ] Build passes
- [ ] PR template filled out

### 5. Merge to develop
- Squash and merge (keeps history clean)
- Delete the feature branch after merge

### 6. Release to main
When `develop` is stable and ready for production:
```bash
git checkout main
git merge develop --no-ff
git tag -a v1.x.x -m "Release v1.x.x"
git push origin main --tags
```

---

## Hotfix (urgent production bug)
```bash
git checkout main
git pull origin main
git checkout -b hotfix/bug-description
# fix the bug
git commit -m "fix: description"
git push -u origin hotfix/bug-description
# Open PR: hotfix/* → main
# After merge, also merge back to develop:
git checkout develop && git merge main
```

---

## Naming Conventions
| Branch type | Format | Example |
|-------------|--------|---------|
| Feature | `feature/short-description` | `feature/add-todo-priority` |
| Bug fix | `fix/short-description` | `fix/email-validation` |
| Hotfix | `hotfix/short-description` | `hotfix/token-expiry-crash` |
| Release | `release/version` | `release/v1.2.0` |

---

## Commit Message Format (Conventional Commits)
```
<type>: <short description>

[optional body]
```
Types: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`

---

## Rules
- **Never** push directly to `main` or `develop`
- **Never** force push to shared branches
- Always open a PR — even when working solo (good habit)
- One PR = one feature/fix (keep PRs small and focused)
- Always pull latest `develop` before creating a new branch
