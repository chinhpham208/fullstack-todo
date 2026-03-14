# Deploy Guide

## Architecture

```
GitHub (main) → Render (backend) + Vercel (frontend)
                      ↑
              MongoDB Atlas (database)
```

## Services

| Service | Purpose | URL |
|---------|---------|-----|
| MongoDB Atlas | Database | mongodb.com/atlas |
| Render | Backend hosting | render.com |
| Vercel | Frontend hosting | vercel.com |
| GitHub Actions | CI/CD | github.com/chinhpham208/fullstack-todo/actions |

## Environment Variables

### Backend (Render → Environment)

| Key | Description |
|-----|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 64-char secret (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `ALLOWED_ORIGINS` | Vercel frontend URL (e.g. `https://fullstack-todo.vercel.app`) |

### Frontend (Vercel → Settings → Environment Variables)

| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Render backend URL (e.g. `https://fullstack-todo-backend-xxxx.onrender.com`) |

### GitHub Secrets (repo → Settings → Secrets → Actions)

| Key | Description |
|-----|-------------|
| `VERCEL_TOKEN` | Vercel API token (vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | From `frontend/.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | From `frontend/.vercel/project.json` → `projectId` |

## CI/CD Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | PR to `develop` or `main` | Typecheck + build backend & frontend |
| `deploy.yml` | Push to `main` (frontend changes) | Deploy frontend to Vercel |
| `keep-alive.yml` | Every 10 minutes | Ping `/ping` to prevent Render cold start |

## Render Setup

1. New Web Service → connect GitHub repo
2. **Root Directory**: `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `node dist/app.js`
5. **Branch**: `main`
6. Add environment variables (see above)

> Render auto-deploys when `main` branch receives new commits.

## Vercel Setup

1. Import GitHub repo
2. **Root Directory**: `frontend`
3. **Framework**: Vite
4. Add environment variables (see above)

> Vercel also auto-deploys on push to `main` (via GitHub integration or GitHub Actions).

## MongoDB Atlas Setup

1. Create free cluster (M0, Singapore region)
2. Database Access → create user with password
3. Network Access → allow `0.0.0.0/0`
4. Connect → Drivers → copy connection string
5. Replace `<password>` and add `/todoapp` before `?retryWrites`

## Deploy Flow (new feature)

```
git checkout develop
git checkout -b feat/your-feature
# ... code ...
git push -u origin feat/your-feature
gh pr create --base develop
# CI runs automatically — fix if fail
gh pr merge <number> --merge
# When ready to release:
gh pr create --base main --head develop
gh pr merge <number> --merge
# Render + Vercel auto-deploy
```
