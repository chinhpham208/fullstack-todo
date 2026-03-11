---
name: db
description: Inspect and manage MongoDB data for this app
---

Check database connection and inspect collections using the MongoDB URI from `backend/.env`.

**Verify connection:**
```bash
cd backend && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('Connected!'); process.exit(0); })
  .catch(err => { console.error(err.message); process.exit(1); });
"
```

**List all users:**
```bash
cd backend && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find().select('-password');
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
});
"
```

**List all todos:**
```bash
cd backend && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Todo = require('./models/Todo');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const todos = await Todo.find();
  console.log(JSON.stringify(todos, null, 2));
  process.exit(0);
});
"
```

**Clear all todos (dev only):**
```bash
cd backend && node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Todo = require('./models/Todo');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Todo.deleteMany({});
  console.log('All todos deleted');
  process.exit(0);
});
"
```

Schema reference:
- User: `name`, `email`, `password` (hashed), `createdAt`
- Todo: `task`, `completed`, `owner` (ref User), `createdAt`
