import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import Todo from "../models/Todo";
import auth from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(auth);

const taskRules = [
  body("task").trim().notEmpty().withMessage("Please enter a task!")
    .isLength({ max: 200 }).withMessage("Task must be under 200 characters!"),
];

// GET ALL TODOS FOR USER
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// ADD NEW TODO
router.post("/", taskRules, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return;
  }

  try {
    const newTodo = new Todo({ task: req.body.task as string, owner: req.user.userId });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// UPDATE TODO — only allow task and completed fields
router.put("/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { task, completed } = req.body as { task?: string; completed?: boolean };
    const update: { task?: string; completed?: boolean } = {};

    if (task !== undefined) {
      if (!task.trim()) {
        res.status(400).json({ error: "Task cannot be empty!" });
        return;
      }
      if (task.trim().length > 200) {
        res.status(400).json({ error: "Task must be under 200 characters!" });
        return;
      }
      update.task = task.trim();
    }
    if (completed !== undefined) {
      update.completed = Boolean(completed);
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      update,
      { new: true }
    );
    if (!todo) {
      res.status(404).json({ error: "Todo not found!" });
      return;
    }
    res.json(todo);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// DELETE TODO
router.delete("/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!todo) {
      res.status(404).json({ error: "Todo not found!" });
      return;
    }
    res.json({ message: "Deleted successfully!" });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
