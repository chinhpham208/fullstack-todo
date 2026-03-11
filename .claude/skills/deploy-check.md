---
name: deploy-check
description: Pre-deployment checklist for this fullstack todo app (Render + Vercel)
---

Run through this checklist before deploying:

**Backend (Render):**
- [ ] `backend/.env` is in `.gitignore` — never committed
- [ ] All required env vars documented: `MONGODB_URI`, `JWT_SECRET`, `PORT`
- [ ] `package.json` has correct `start` script: `node app.js`
- [ ] CORS configured to allow frontend domain
- [ ] MongoDB Atlas connection string uses correct cluster and db name
- [ ] Health check endpoint `/ping` is working

**Frontend (Vercel):**
- [ ] `frontend/.env` is in `.gitignore` — never committed
- [ ] `VITE_API_URL` set to Render backend URL in Vercel environment variables
- [ ] `vite.config.js` has no hardcoded localhost references
- [ ] `npm run build` completes without errors

**General:**
- [ ] No Vietnamese variable names, file names, or strings in code
- [ ] `node_modules` and `dist` excluded from git
- [ ] Latest changes committed and pushed to GitHub

Run `npm run build` in frontend to verify build passes before deploying.
