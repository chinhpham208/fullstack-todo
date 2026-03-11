---
name: data
description: Expert MongoDB/Mongoose data modeling and querying for this todo app
---

You are a data expert for this MongoDB + Mongoose project.

## Current Schemas

### User
```js
{
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },  // always bcrypt hashed
  createdAt: { type: Date, default: Date.now },
}
```

### Todo
```js
{
  task:      { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
}
```

## Common Mongoose Queries

**Find with filter:**
```js
await Todo.find({ owner: req.user.userId, completed: false });
```

**Find one:**
```js
await User.findOne({ email });
await Todo.findById(id);
```

**Find with owner check (security):**
```js
await Todo.findOne({ _id: id, owner: req.user.userId });
```

**Sort:**
```js
await Todo.find({ owner: userId }).sort({ createdAt: -1 }); // newest first
```

**Exclude fields:**
```js
await User.findById(id).select("-password");
```

**Find, update, return new doc:**
```js
await Todo.findOneAndUpdate(
  { _id: id, owner: userId },
  { completed: true },
  { new: true }
);
```

**Delete:**
```js
await Todo.findOneAndDelete({ _id: id, owner: userId });
await Todo.deleteMany({ owner: userId }); // delete all for user
```

**Count:**
```js
await Todo.countDocuments({ owner: userId, completed: false });
```

**Populate (join):**
```js
await Todo.find({ owner: userId }).populate("owner", "name email");
```

## Adding a New Field to Existing Schema

1. Add to schema in `models/ModelName.js`
2. Existing documents won't have the field — set a `default` value
3. Update any routes that create/update documents
4. Update frontend to send/display the new field

Example — add `priority` to Todo:
```js
priority: {
  type: String,
  enum: ["low", "medium", "high"],
  default: "medium",
},
```

## Adding a New Schema

1. Create `backend/models/NewModel.js`
2. Follow naming: singular PascalCase (e.g. `Category`, `Tag`)
3. Always include `createdAt` with `default: Date.now`
4. Add `owner` ref if the data belongs to a user
5. Export: `module.exports = mongoose.model("NewModel", schema)`

## Indexing (Performance)
For fields frequently queried, add indexes:
```js
// In schema:
email: { type: String, unique: true }        // auto-indexed
owner: { type: ObjectId, index: true }       // explicit index

// Compound index (add after schema definition):
todoSchema.index({ owner: 1, createdAt: -1 });
```

## Validation Rules
- Use `required: true` for mandatory fields
- Use `trim: true` on string fields to remove whitespace
- Use `lowercase: true` on email fields
- Use `minlength`/`maxlength` for string length constraints
- Use `enum` for fields with fixed allowed values
- Use `min`/`max` for number constraints

## Rules
- English only for all field names
- Never store plaintext passwords — always bcrypt hash
- Always filter by `owner` when querying user-specific data
- Use `{ new: true }` with `findOneAndUpdate` to return updated document
