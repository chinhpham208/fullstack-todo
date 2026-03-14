# TaskFlow - Collaborative Kanban Workspace

A collaborative task management app with Kanban boards, team management, and real-time activity tracking.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Ant Design + @dnd-kit
- **Backend:** Node.js + Express + TypeScript + MongoDB + JWT Auth
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
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=<generate with: openssl rand -base64 32>
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
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

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login |
| GET | /auth/me | Yes | Get current user |

### Workspaces
| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | /workspaces | Yes | — | Create workspace |
| GET | /workspaces | Yes | — | List user's workspaces |
| GET | /workspaces/:id | Yes | member | Get workspace details |
| PUT | /workspaces/:id | Yes | admin+ | Update workspace |
| DELETE | /workspaces/:id | Yes | owner | Delete workspace |
| POST | /workspaces/:id/invite | Yes | admin+ | Invite member |
| PUT | /workspaces/:id/members/:userId | Yes | admin+ | Change role |
| DELETE | /workspaces/:id/members/:userId | Yes | admin+ | Remove member |

### Boards
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /workspaces/:wid/boards | Yes | Create board |
| GET | /workspaces/:wid/boards | Yes | List boards |
| GET | /workspaces/:wid/boards/:bid | Yes | Get board + columns + cards |
| PUT | /workspaces/:wid/boards/:bid | Yes | Update board |
| DELETE | /workspaces/:wid/boards/:bid | Yes | Delete board (admin+) |

### Columns & Cards
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /boards/:bid/columns | Yes | Create column |
| PUT | /boards/:bid/columns/:cid | Yes | Update column |
| DELETE | /boards/:bid/columns/:cid | Yes | Delete column (admin+) |
| PUT | /boards/:bid/columns | Yes | Reorder columns |
| POST | /boards/:bid/cards | Yes | Create card |
| GET | /boards/:bid/cards | Yes | Get all cards |
| PUT | /boards/:bid/cards/:cid | Yes | Update card |
| PUT | /boards/:bid/cards/:cid/move | Yes | Move card |
| DELETE | /boards/:bid/cards/:cid | Yes | Delete card |

### Comments & Activity
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /cards/:cid/comments | Yes | Add comment |
| GET | /cards/:cid/comments | Yes | List comments |
| PUT | /cards/:cid/comments/:id | Yes | Edit comment (author) |
| DELETE | /cards/:cid/comments/:id | Yes | Delete comment |
| GET | /workspaces/:wid/activity | Yes | Activity feed (paginated) |

### Invitations
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /invitations | Yes | List pending invitations |
| POST | /invitations/:id/accept | Yes | Accept invitation |
| POST | /invitations/:id/decline | Yes | Decline invitation |

### Health
| Method | Route | Description |
|--------|-------|-------------|
| GET | /ping | Health check |

---

## Deployment

### Backend → Render.com
1. Go to render.com → New Web Service → Connect GitHub
2. Select this repo, set root directory to `backend`
3. Build Command: `npm install`
4. Start Command: `node dist/app.js`
5. Add Environment Variables:
   - `MONGODB_URI` = MongoDB Atlas connection string
   - `JWT_SECRET` = strong random string (`openssl rand -base64 32`)
   - `NODE_ENV` = production
   - `ALLOWED_ORIGINS` = your Vercel frontend URL
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
│   ├── middleware/        # auth.ts, workspaceAuth.ts
│   ├── models/           # User, Workspace, Board, Column, Card, Comment, Activity, Invitation
│   ├── routes/           # auth, workspace, board, column, card, comment, activity, invitation
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # logActivity.ts
│   ├── .env.example
│   └── app.ts            # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # kanban, card, layout
│   │   ├── contexts/    # WorkspaceContext
│   │   ├── pages/       # Login, Register, WorkspaceList, Board, NewBoard, Members, Activity
│   │   ├── api.ts       # Axios instance with auth interceptor
│   │   ├── types.ts     # TypeScript interfaces
│   │   └── App.tsx      # Router and providers
│   └── index.html
├── .claude/
│   └── skills/           # Claude Code skills
├── .github/
│   └── pull_request_template.md
└── CLAUDE.md             # Claude Code instructions
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
