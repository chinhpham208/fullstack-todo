import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { workspaceFromBoard, workspaceRole } from "../middleware/workspaceAuth";
import Column from "../models/Column";
import Card from "../models/Card";
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

// Create column
router.post("/", [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Column name is required!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { name } = req.body as { name: string };

    // Find max position in this board
    const lastColumn = await Column.findOne({ board: req.params.boardId })
      .sort({ position: -1 });
    const position = lastColumn ? lastColumn.position + 1000 : 1000;

    const column = await Column.create({
      name,
      board: req.params.boardId,
      position,
    });

    await logActivity({
      workspace: req.board!.get("workspace"),
      board: req.board!._id,
      user: req.user.userId,
      action: "column_created",
      metadata: { name },
    });

    res.status(201).json(column);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Update column name
router.put("/:columnId", [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Column name is required!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const column = await Column.findOneAndUpdate(
      { _id: req.params.columnId, board: req.params.boardId },
      { name: (req.body as { name: string }).name },
      { new: true }
    );
    if (!column) {
      res.status(404).json({ error: "Column not found!" });
      return;
    }
    res.json(column);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Delete column
router.delete("/:columnId", workspaceRole("admin", "owner"), async (req: Request, res: Response): Promise<void> => {
  try {
    const column = await Column.findOneAndDelete({
      _id: req.params.columnId,
      board: req.params.boardId,
    });
    if (!column) {
      res.status(404).json({ error: "Column not found!" });
      return;
    }

    // Delete all cards in this column
    await Card.deleteMany({ column: column._id });

    await logActivity({
      workspace: req.board!.get("workspace"),
      board: req.board!._id,
      user: req.user.userId,
      action: "column_deleted",
      metadata: { name: column.name },
    });

    res.json({ message: "Column deleted!" });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Reorder columns
router.put("/", [
  body("columns").isArray({ min: 1 }).withMessage("Columns array is required!"),
  body("columns.*.id").isMongoId().withMessage("Invalid column ID!"),
  body("columns.*.position").isInt({ min: 0 }).withMessage("Position must be a positive integer!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { columns } = req.body as { columns: Array<{ id: string; position: number }> };

    const ops = columns.map((col) => ({
      updateOne: {
        filter: { _id: col.id, board: req.params.boardId },
        update: { position: col.position },
      },
    }));
    await Column.bulkWrite(ops);

    const updated = await Column.find({ board: req.params.boardId }).sort({ position: 1 });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
