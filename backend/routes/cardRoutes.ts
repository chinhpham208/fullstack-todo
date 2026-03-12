import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { workspaceFromBoard } from "../middleware/workspaceAuth";
import Card from "../models/Card";
import Column from "../models/Column";
import { logActivity } from "../utils/logActivity";

const router = Router({ mergeParams: true });
router.use(auth);
router.use(workspaceFromBoard);

const validate = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
};

// Create card
router.post("/", [
  body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title is required (max 200 chars)!"),
  body("columnId").isMongoId().withMessage("Column ID is required!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { title, columnId, description } = req.body as {
      title: string; columnId: string; description?: string;
    };

    // Verify column belongs to this board
    const column = await Column.findOne({ _id: columnId, board: req.params.boardId });
    if (!column) {
      res.status(404).json({ error: "Column not found!" });
      return;
    }

    // Get max position in column
    const lastCard = await Card.findOne({ column: columnId }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1000 : 1000;

    const card = await Card.create({
      title,
      description: description || "",
      column: columnId,
      board: req.params.boardId,
      position,
      createdBy: req.user.userId,
    });

    const populated = await Card.findById(card._id)
      .populate("assignees", "name email")
      .populate("createdBy", "name email");

    await logActivity({
      workspace: req.board!.get("workspace"),
      board: req.board!._id,
      card: card._id,
      user: req.user.userId,
      action: "card_created",
      metadata: { title, column: column.name },
    });

    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Get all cards for board
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const cards = await Card.find({ board: req.params.boardId })
      .populate("assignees", "name email")
      .populate("createdBy", "name email")
      .sort({ position: 1 });
    res.json(cards);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Get card detail
router.get("/:cardId", async (req: Request, res: Response): Promise<void> => {
  try {
    const card = await Card.findOne({ _id: req.params.cardId, board: req.params.boardId })
      .populate("assignees", "name email")
      .populate("createdBy", "name email");
    if (!card) {
      res.status(404).json({ error: "Card not found!" });
      return;
    }
    res.json(card);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Update card
router.put("/:cardId", async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, completed, assignees } = req.body as {
      title?: string; description?: string; completed?: boolean; assignees?: string[];
    };

    const update: Record<string, unknown> = {};
    if (title !== undefined) {
      if (!title.trim() || title.trim().length > 200) {
        res.status(400).json({ error: "Title must be 1-200 characters!" });
        return;
      }
      update.title = title.trim();
    }
    if (description !== undefined) update.description = description;
    if (completed !== undefined) update.completed = Boolean(completed);
    if (assignees !== undefined) update.assignees = assignees;

    const card = await Card.findOneAndUpdate(
      { _id: req.params.cardId, board: req.params.boardId },
      update,
      { new: true }
    )
      .populate("assignees", "name email")
      .populate("createdBy", "name email");

    if (!card) {
      res.status(404).json({ error: "Card not found!" });
      return;
    }

    await logActivity({
      workspace: req.board!.get("workspace"),
      board: req.board!._id,
      card: card._id,
      user: req.user.userId,
      action: "card_updated",
      metadata: { fields: Object.keys(update) },
    });

    res.json(card);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Move card (change column and/or position)
router.put("/:cardId/move", [
  body("columnId").isMongoId().withMessage("Column ID is required!"),
  body("position").isInt({ min: 0 }).withMessage("Position is required!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { columnId, position } = req.body as { columnId: string; position: number };

    const card = await Card.findOne({ _id: req.params.cardId, board: req.params.boardId });
    if (!card) {
      res.status(404).json({ error: "Card not found!" });
      return;
    }

    // Verify target column belongs to same board
    const targetColumn = await Column.findOne({ _id: columnId, board: req.params.boardId });
    if (!targetColumn) {
      res.status(404).json({ error: "Target column not found!" });
      return;
    }

    const oldColumnId = card.column.toString();
    card.column = targetColumn._id;
    card.position = position;
    await card.save();

    if (oldColumnId !== columnId) {
      const oldColumn = await Column.findById(oldColumnId);
      await logActivity({
        workspace: req.board!.get("workspace"),
        board: req.board!._id,
        card: card._id,
        user: req.user.userId,
        action: "card_moved",
        metadata: {
          fromColumn: oldColumn?.name || "Unknown",
          toColumn: targetColumn.name,
        },
      });
    }

    const populated = await Card.findById(card._id)
      .populate("assignees", "name email")
      .populate("createdBy", "name email");
    res.json(populated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Delete card
router.delete("/:cardId", async (req: Request, res: Response): Promise<void> => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.cardId, board: req.params.boardId });
    if (!card) {
      res.status(404).json({ error: "Card not found!" });
      return;
    }

    await logActivity({
      workspace: req.board!.get("workspace"),
      board: req.board!._id,
      card: card._id,
      user: req.user.userId,
      action: "card_deleted",
      metadata: { title: card.title },
    });

    res.json({ message: "Card deleted!" });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
