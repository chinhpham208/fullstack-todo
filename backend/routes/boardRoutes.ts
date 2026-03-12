import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { workspaceMember, workspaceRole } from "../middleware/workspaceAuth";
import Board from "../models/Board";
import Column from "../models/Column";
import Card from "../models/Card";
import { logActivity } from "../utils/logActivity";
import { Types } from "mongoose";

const router = Router({ mergeParams: true });
router.use(auth);
router.use(workspaceMember);

const validate = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
};

const nameRules = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Board name is required (max 100 chars)!"),
];

// Create board with default columns
router.post("/", nameRules, async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { name } = req.body as { name: string };
    const board = await Board.create({
      name,
      workspace: req.params.workspaceId,
      createdBy: req.user.userId,
    });

    // Create default columns
    await Column.insertMany([
      { name: "To Do", board: board._id, position: 1000 },
      { name: "In Progress", board: board._id, position: 2000 },
      { name: "Done", board: board._id, position: 3000 },
    ]);

    await logActivity({
      workspace: new Types.ObjectId(req.params.workspaceId as string),
      board: board._id,
      user: req.user.userId,
      action: "board_created",
      metadata: { name },
    });

    res.status(201).json(board);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// List boards in workspace
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const boards = await Board.find({ workspace: req.params.workspaceId })
      .sort({ createdAt: -1 });
    res.json(boards);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Get board with columns and cards
router.get("/:boardId", async (req: Request, res: Response): Promise<void> => {
  try {
    const board = await Board.findOne({
      _id: req.params.boardId,
      workspace: req.params.workspaceId,
    });
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    const columns = await Column.find({ board: board._id }).sort({ position: 1 });
    const cards = await Card.find({ board: board._id })
      .populate("assignees", "name email")
      .populate("createdBy", "name email")
      .sort({ position: 1 });

    res.json({ board, columns, cards });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Update board name
router.put("/:boardId", nameRules, async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { name } = req.body as { name: string };
    const board = await Board.findOneAndUpdate(
      { _id: req.params.boardId, workspace: req.params.workspaceId },
      { name },
      { new: true }
    );
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }
    res.json(board);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Delete board
router.delete("/:boardId", workspaceRole("admin", "owner"), async (req: Request, res: Response): Promise<void> => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.boardId,
      workspace: req.params.workspaceId,
    });
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    // Clean up columns and cards
    await Column.deleteMany({ board: board._id });
    await Card.deleteMany({ board: board._id });

    res.json({ message: "Board deleted!" });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
