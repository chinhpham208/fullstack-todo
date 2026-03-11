const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

const taskRules = [
  body("task").trim().notEmpty().withMessage("Please enter a task!")
    .isLength({ max: 200 }).withMessage("Task must be under 200 characters!"),
];

// GET ALL TODOS FOR USER
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD NEW TODO
router.post("/", taskRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const newTodo = new Todo({
      task: req.body.task,
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
