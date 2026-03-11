---
name: add-feature
description: Scaffold a new feature following the project's existing patterns
---

When adding a new feature to this MERN app, follow this pattern:

## 1. Backend — New Model (if needed)
Add to `backend/models/`:
- Define Mongoose schema with English field names
- Add `createdAt: { type: Date, default: Date.now }`
- Export with `mongoose.model('ModelName', schema)`

## 2. Backend — New Route
Add to `backend/routes/` or extend existing route file:
- Import `auth` middleware from `../middleware/auth`
- Apply `router.use(auth)` if all routes need auth
- Use try/catch on every async handler
- Return `{ error: '...' }` for errors, `{ message: '...' }` for success
- Register route in `backend/app.js` with `app.use('/path', routeFile)`

## 3. Frontend — New API call
Add to `frontend/src/api.js` or call inline in component:
- Always use the `api` axios instance (never raw `fetch` or `axios`)
- Handle loading state with `useState(false)` → set true before call, false in finally
- Handle error state with `useState('')` → set error message in catch

## 4. Frontend — New Page
Add to `frontend/src/pages/`:
- File name in PascalCase English (e.g. `Profile.jsx`)
- Import and register in `App.jsx` with a `<Route>`
- Wrap with `<PrivateRoute>` if authentication required
- Use inline styles following existing style object pattern

## Checklist before committing:
- [ ] All names in English
- [ ] Auth middleware applied where needed
- [ ] Error handling in place (frontend + backend)
- [ ] No hardcoded URLs or secrets
- [ ] Run `/review` to check code quality
