# Fullstack Todo App — Claude Instructions

## Project Overview
MERN stack todo application with JWT authentication.
- **Frontend:** React 18 + Vite → deploy on Vercel
- **Backend:** Node.js + Express + MongoDB → deploy on Render
- **Auth:** JWT stored in localStorage

## Stack & Key Files
- `backend/app.js` — Express server entry point
- `backend/middleware/auth.js` — JWT auth middleware
- `backend/models/User.js` — User schema (name, email, password, createdAt)
- `backend/models/Todo.js` — Todo schema (task, completed, owner, createdAt)
- `backend/routes/authRoutes.js` — /auth/register, /auth/login, /auth/me
- `backend/routes/todoRoutes.js` — /todos CRUD (all protected)
- `frontend/src/api.js` — Axios instance with auto token injection
- `frontend/src/App.jsx` — Routes: /login, /register, / (protected)
- `frontend/src/pages/Login.jsx` — Login page
- `frontend/src/pages/Register.jsx` — Register page
- `frontend/src/pages/Home.jsx` — Main todo page

## Environment Variables
**Backend** (`backend/.env`):
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret key for signing tokens
- `PORT` — Server port (default 3000)

**Frontend** (`frontend/.env`):
- `VITE_API_URL` — Backend URL (localhost for dev, Render URL for prod)

## Coding Rules
- **English only** — all variable names, function names, file names, comments, and strings must be in English
- Never commit `.env` files
- Always use the centralized `api.js` for frontend HTTP calls
- All backend routes that need auth must use the `auth` middleware
- Passwords always hashed with bcrypt, never stored plaintext
- Response error key: `error`, success key: `message`

## API Routes Reference
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login |
| GET | /auth/me | Yes | Get current user |
| GET | /todos | Yes | Get all todos |
| POST | /todos | Yes | Create todo |
| PUT | /todos/:id | Yes | Update todo |
| DELETE | /todos/:id | Yes | Delete todo |
| GET | /ping | No | Health check |

## Available Skills
- `/commit` — create a conventional git commit
- `/review` — review code for security and quality
- `/deploy-check` — pre-deployment checklist
- `/api-test` — test all API endpoints with curl
