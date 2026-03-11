---
name: env-setup
description: Set up environment variables for local development and production
---

## Local Development Setup

**Backend** — create `backend/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/todoapp?appName=Cluster0
JWT_SECRET=some-long-random-secret-string-here
PORT=3000
```

**Frontend** — create `frontend/.env`:
```
VITE_API_URL=http://localhost:3000
```

## Production Setup

**Render (Backend):**
Add these in Render dashboard → Environment:
- `MONGODB_URI` → MongoDB Atlas connection string
- `JWT_SECRET` → strong random string (generate: `openssl rand -base64 32`)
- `PORT` → leave empty (Render sets it automatically)

**Vercel (Frontend):**
Add in Vercel dashboard → Settings → Environment Variables:
- `VITE_API_URL` → your Render backend URL (e.g. `https://fullstack-todo-xxxx.onrender.com`)

## Generate a strong JWT_SECRET:
```bash
openssl rand -base64 32
```

## Verify env vars are loaded:
```bash
cd backend && node -e "require('dotenv').config(); console.log('MONGODB_URI:', !!process.env.MONGODB_URI, '| JWT_SECRET:', !!process.env.JWT_SECRET)"
```

## Important:
- Never commit `.env` files — both are in `.gitignore`
- Never use the same JWT_SECRET in dev and prod
- Rotate JWT_SECRET if it's ever exposed (all users will be logged out)
