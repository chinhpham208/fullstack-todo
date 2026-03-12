import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth";
import { workspaceFromCard } from "../middleware/workspaceAuth";
import Comment from "../models/Comment";
import User from "../models/User";
import { logActivity } from "../utils/logActivity";

const router = Router({ mergeParams: true });
router.use(auth);
router.use(workspaceFromCard);

const validate = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
};

// Parse @mentions from content — matches @username patterns
async function parseMentions(content: string, workspaceMembers: Array<{ user: { toString(): string } }>): Promise<string[]> {
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  const mentionNames: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentionNames.push(match[1]);
  }
  if (mentionNames.length === 0) return [];

  const memberIds = workspaceMembers.map((m) => m.user.toString());
  const users = await User.find({
    _id: { $in: memberIds },
    name: { $in: mentionNames.map((n) => new RegExp(`^${n}$`, "i")) },
  });
  return users.map((u) => u._id.toString());
}

// Add comment
router.post("/", [
  body("content").trim().isLength({ min: 1, max: 2000 }).withMessage("Comment is required (max 2000 chars)!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { content } = req.body as { content: string };
    const mentions = await parseMentions(content, req.workspace!.get("members"));

    const comment = await Comment.create({
      content,
      card: req.params.cardId,
      author: req.user.userId,
      mentions,
    });

    const populated = await Comment.findById(comment._id)
      .populate("author", "name email")
      .populate("mentions", "name email");

    await logActivity({
      workspace: req.workspace!._id,
      board: req.board!._id,
      card: req.card!._id,
      user: req.user.userId,
      action: "comment_added",
      metadata: { cardTitle: req.card!.get("title") },
    });

    res.status(201).json(populated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// List comments for card
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.find({ card: req.params.cardId })
      .populate("author", "name email")
      .populate("mentions", "name email")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Edit comment (author only)
router.put("/:commentId", [
  body("content").trim().isLength({ min: 1, max: 2000 }).withMessage("Comment is required (max 2000 chars)!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      card: req.params.cardId,
    });
    if (!comment) {
      res.status(404).json({ error: "Comment not found!" });
      return;
    }
    if (comment.author.toString() !== req.user.userId) {
      res.status(403).json({ error: "You can only edit your own comments!" });
      return;
    }

    const { content } = req.body as { content: string };
    const mentions = await parseMentions(content, req.workspace!.get("members"));
    comment.content = content;
    comment.mentions = mentions as unknown as typeof comment.mentions;
    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate("author", "name email")
      .populate("mentions", "name email");
    res.json(populated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Delete comment (author or admin+)
router.delete("/:commentId", async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      card: req.params.cardId,
    });
    if (!comment) {
      res.status(404).json({ error: "Comment not found!" });
      return;
    }

    const isAuthor = comment.author.toString() === req.user.userId;
    const isAdminOrOwner = req.memberRole === "admin" || req.memberRole === "owner";
    if (!isAuthor && !isAdminOrOwner) {
      res.status(403).json({ error: "You don't have permission to delete this comment!" });
      return;
    }

    await Comment.findByIdAndDelete(comment._id);
    res.json({ message: "Comment deleted!" });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
