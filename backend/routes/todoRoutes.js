const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// GET ALL TODOS FOR USER
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ owner: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW TODO
router.post("/", async (req, res) => {
  try {
    const { task } = req.body;
    if (!task || !task.trim()) {
      return res.status(400).json({ error: "Please enter a task!" });
    }
    if (task.trim().length > 200) {
      return res.status(400).json({ error: "Task must be under 200 characters!" });
    }

    const newTodo = new Todo({
      task: task.trim(),
      owner: req.user.userId,
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE TODO
router.put("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ error: "Todo not found!" });
    }
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE TODO
router.delete("/:id", async (req, res) => {
  try {
    await Todo.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId,
    });
    res.json({ message: "Deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
