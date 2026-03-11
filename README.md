# 📝 Fullstack Todo App

A personal task management app built with React + Node.js + MongoDB.

## Tech Stack

- **Frontend:** React 18 + Vite + React Router + Axios + React Hook Form + Yup
- **Backend:** Node.js + Express + JWT Auth + express-validator + Helmet
- **Database:** MongoDB (local) / MongoDB Atlas (production)
- **Deploy:** Vercel (frontend) + Render (backend)

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB installed locally (`brew install mongodb-community`)

### 1. Clone repo
```bash
git clone https://github.com/chinhpham208/fullstack-todo.git
cd fullstack-todo
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=<generate with: openssl rand -base64 32>
PORT=3000
```

```bash
npm run dev
# Server running at http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:3000 (already set in .env.example)
npm run dev
# App running at http://localhost:5173
```

### 4. Start MongoDB
```bash
brew services start mongodb/brew/mongodb-community
```

---

## API Reference

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

---

## Deployment

### Backend → Render.com
1. Go to render.com → New Web Service → Connect GitHub
2. Select this repo, set root directory to `backend`
3. Build Command: `npm install`
4. Start Command: `node app.js`
5. Add Environment Variables:
   - `MONGODB_URI` = MongoDB Atlas connection string
   - `JWT_SECRET` = strong random string (`openssl rand -base64 32`)
   - `FRONTEND_URL` = your Vercel frontend URL
6. Deploy → copy the URL (e.g. `https://your-app.onrender.com`)

### Frontend → Vercel.com
1. Go to vercel.com → New Project → Import GitHub repo
2. Root Directory: `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy

### Keep Render Server Alive (Free Tier)
Set up a cron job at cron-job.org to ping `https://your-app.onrender.com/ping` every 10 minutes.

---

## Project Structure

```
fullstack-todo/
├── backend/
│   ├── middleware/     # auth.js — JWT verification
│   ├── models/         # User.js, Todo.js
│   ├── routes/         # authRoutes.js, todoRoutes.js
│   ├── .env.example    # Environment variable template
│   └── app.js          # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── pages/      # Login.jsx, Register.jsx, Home.jsx
│   │   ├── api.js      # Axios instance with auth interceptor
│   │   └── App.jsx     # Router and PrivateRoute
│   └── index.html
├── .claude/
│   └── skills/         # Claude Code skills
├── .github/
│   └── pull_request_template.md
└── CLAUDE.md           # Claude Code instructions
```

---

## Git Workflow

```
main        ← production only
develop     ← integration branch
feature/*   ← new features (PR → develop)
fix/*       ← bug fixes (PR → develop)
hotfix/*    ← urgent fixes (PR → main)
```
