import { Router, Request, Response } from "express";
import auth from "../middleware/auth";
import { workspaceMember } from "../middleware/workspaceAuth";
import Activity from "../models/Activity";

const router = Router({ mergeParams: true });
router.use(auth);
router.use(workspaceMember);

// Get activity feed (paginated)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ workspace: req.params.workspaceId })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments({ workspace: req.params.workspaceId }),
    ]);

    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
