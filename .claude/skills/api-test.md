---
name: api-test
description: Test all backend API endpoints for this todo app
---

Test all endpoints using curl against the local server (http://localhost:3000).
Ensure the backend is running first with `npm run dev` in the backend folder.

**Auth endpoints:**

1. Register:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'
```

2. Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```
Save the returned `token` for authenticated requests.

3. Get current user:
```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token>"
```

**Todo endpoints (all require Authorization header):**

4. Get all todos:
```bash
curl http://localhost:3000/todos -H "Authorization: Bearer <token>"
```

5. Add todo:
```bash
curl -X POST http://localhost:3000/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"task":"Buy groceries"}'
```

6. Update todo (toggle completed):
```bash
curl -X PUT http://localhost:3000/todos/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

7. Delete todo:
```bash
curl -X DELETE http://localhost:3000/todos/<id> \
  -H "Authorization: Bearer <token>"
```

8. Health check:
```bash
curl http://localhost:3000/ping
```

Verify each response has correct HTTP status code and JSON structure.
