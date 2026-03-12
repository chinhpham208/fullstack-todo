# TaskFlow — Claude Instructions

## Project Overview
MERN stack collaborative workspace with Kanban boards, team management, and real-time activity tracking.
- **Frontend:** React 18 + Vite + Ant Design + @dnd-kit → deploy on Vercel
- **Backend:** Node.js + Express + TypeScript + MongoDB → deploy on Render
- **Auth:** JWT stored in localStorage
- **UI:** Ant Design v5 with purple brand theme (#667eea)

## Stack & Key Files

### Backend (TypeScript)
- `backend/app.ts` — Express server entry point, route registration
- `backend/middleware/auth.ts` — JWT auth middleware
- `backend/middleware/workspaceAuth.ts` — Workspace membership + role checks
- `backend/models/User.ts` — User schema
- `backend/models/Workspace.ts` — Workspace with members and roles
- `backend/models/Board.ts` — Board belongs to workspace
- `backend/models/Column.ts` — Column with position ordering
- `backend/models/Card.ts` — Card (replaces Todo) with assignees
- `backend/models/Comment.ts` — Comments on cards with @mentions
- `backend/models/Activity.ts` — Activity log for all workspace actions
- `backend/models/Invitation.ts` — Email invitations with tokens
- `backend/models/Todo.ts` — Legacy todo model (deprecated)
- `backend/utils/logActivity.ts` — Activity logging utility
- `backend/types/index.ts` — All TypeScript interfaces
- `backend/scripts/migrate-todos-to-cards.ts` — Data migration script

### Frontend (TypeScript)
- `frontend/src/App.tsx` — Routes, ConfigProvider, WorkspaceProvider
- `frontend/src/api.ts` — Axios instance with auto token injection
- `frontend/src/types.ts` — All frontend TypeScript interfaces
- `frontend/src/contexts/WorkspaceContext.tsx` — Workspace/board state
- `frontend/src/components/layout/AppLayout.tsx` — Main layout with sidebar
- `frontend/src/components/kanban/KanbanBoard.tsx` — Drag-drop board
- `frontend/src/components/kanban/KanbanColumn.tsx` — Droppable column
- `frontend/src/components/kanban/KanbanCard.tsx` — Draggable card
- `frontend/src/components/card/CardDetailModal.tsx` — Card edit modal
- `frontend/src/components/card/CommentSection.tsx` — Comments with @mentions
- `frontend/src/pages/` — Login, Register, WorkspaceList, Board, NewBoard, Members, Activity

## Environment Variables
**Backend** (`backend/.env`):
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for signing tokens
- `PORT` — Server port (default 3000)
- `NODE_ENV` — production/development
- `ALLOWED_ORIGINS` — CORS allowed origins (comma-separated)

**Frontend** (`frontend/.env`):
- `VITE_API_URL` — Backend URL

## Coding Rules
- **English only** — all code, comments, and strings in English
- **TypeScript** — strict mode, no `any` where avoidable
- Never commit `.env` files
- Use centralized `api.ts` for all frontend HTTP calls
- All workspace routes use `workspaceAuth` middleware for membership/role checks
- All auth routes use `auth` middleware
- Passwords hashed with bcrypt, never stored plaintext
- Response error key: `error`, success key: `message`
- Card positioning uses integer gaps (1000, 2000...) for drag-drop ordering

## API Routes Reference

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

## Available Skills

### Development
- `/frontend` — React/Vite expert: components, state, routing, Ant Design
- `/backend` — Express/Node.js expert: routes, middleware, auth
- `/data` — MongoDB/Mongoose expert: schemas, queries, data modeling
- `/ui` — UI/UX guidelines, Ant Design patterns
- `/style` — Restyle/improve UI components

### Workflow
- `/git-flow` — standard Git Flow: branches, PRs, releases
- `/dev` — start frontend + backend dev servers
- `/build` — build frontend for production
- `/env-setup` — set up environment variables (local + production)
- `/add-feature` — scaffold a new feature following project patterns

### Quality
- `/commit` — create a conventional git commit
- `/review` — review code for security and quality
- `/api-test` — test all API endpoints with curl
- `/debug` — diagnose and fix common issues
- `/deploy-check` — pre-deployment checklist

## Git Branch Structure
- `main` — production only, never commit directly
- `develop` — integration branch, base for all features
- `feature/*` — new features (PR → develop)
- `fix/*` — bug fixes (PR → develop)
- `hotfix/*` — urgent fixes (PR → main, then merge back to develop)
