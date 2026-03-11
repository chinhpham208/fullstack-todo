---
name: build
description: Build the frontend for production and verify output
---

Build the frontend production bundle:

```bash
cd frontend && npm run build
```

After build:
1. Check `frontend/dist/` folder was created
2. Verify no build errors or warnings
3. Preview the production build locally:
```bash
cd frontend && npm run preview
```
Runs on http://localhost:4173

**Common build errors and fixes:**
- `VITE_API_URL` not set → add to `frontend/.env`
- Import path errors → check file names match exactly (case-sensitive)
- Unused variable warnings → clean up before deploying

The `dist/` folder should never be committed (already in .gitignore).
