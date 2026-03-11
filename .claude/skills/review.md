---
name: review
description: Review code for quality, security, and best practices in this MERN stack project
---

Perform a thorough code review focusing on:

**Security:**
- No secrets/credentials hardcoded in source files
- JWT secret is strong and stored in .env
- Passwords are hashed with bcrypt (never stored plaintext)
- Auth middleware applied to all protected routes
- Input validation on all API endpoints

**Backend (Node.js/Express):**
- Error handling with try/catch on all async routes
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Mongoose schema validation in place
- No sensitive data returned in responses (e.g. passwords)

**Frontend (React/Vite):**
- API calls use the centralized `api.js` axios instance
- Token stored/retrieved from localStorage correctly
- Loading and error states handled in UI
- No hardcoded API URLs (use VITE_API_URL env var)

**Code Quality:**
- English naming for all variables, functions, files, and comments
- No unused variables or imports
- Consistent code style

Report issues by severity: Critical > High > Medium > Low.
