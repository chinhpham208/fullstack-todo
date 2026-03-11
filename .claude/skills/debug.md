---
name: debug
description: Debug common issues in this fullstack todo app
---

Systematically diagnose and fix issues.

## Backend Issues

**Server won't start:**
- Check `backend/.env` exists with `MONGODB_URI`, `JWT_SECRET`, `PORT`
- Run `cd backend && npm install` to ensure deps installed
- Look for port conflict: `lsof -i :3000`

**MongoDB connection error:**
- Verify `MONGODB_URI` in `.env` is correct
- Check MongoDB Atlas cluster is running and IP is whitelisted (0.0.0.0/0 for dev)
- Test connection with `/db` skill

**401 Unauthorized:**
- Token missing or expired in request header
- Check frontend sends `Authorization: Bearer <token>`
- Verify `JWT_SECRET` matches between token creation and verification

**404 Not Found on routes:**
- Confirm route path matches exactly (e.g. `/auth/register` not `/auth/dang-ky`)
- Check middleware import path: `require('../middleware/auth')`

## Frontend Issues

**Blank page / app not loading:**
- Check browser console for errors
- Verify `VITE_API_URL` in `frontend/.env` points to running backend
- Run `cd frontend && npm install`

**API calls failing (Network Error):**
- Backend not running → start with `npm run dev` in backend
- CORS error → backend needs to allow frontend origin
- Wrong base URL → check `VITE_API_URL` value

**Redirect loop on login:**
- Token corrupted in localStorage → clear with `localStorage.clear()` in browser console
- PrivateRoute logic issue → check `App.jsx`

**Todo not showing after add:**
- Check response from POST `/todos` — should return new todo object
- Verify frontend updates state with `setTodos([res.data, ...todos])`

## General Debug Steps
1. Check browser Network tab for failed requests
2. Check backend terminal for error logs
3. Verify `.env` variables are loaded correctly
4. Run `git status` to see if unexpected files changed
