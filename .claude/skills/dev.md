---
name: dev
description: Start both frontend and backend dev servers
---

Start the development environment:

**Backend** (terminal 1):
```bash
cd backend && npm run dev
```
Runs on http://localhost:3000 with nodemon (auto-restart on file change).

**Frontend** (terminal 2):
```bash
cd frontend && npm run dev
```
Runs on http://localhost:5173 with Vite HMR.

Verify both are running:
- Backend: `curl http://localhost:3000/ping`
- Frontend: open http://localhost:5173 in browser

Check `backend/.env` has valid `MONGODB_URI` and `JWT_SECRET` before starting.
