import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import crypto from "crypto";
import auth from "../middleware/auth";
import { workspaceMember, workspaceRole } from "../middleware/workspaceAuth";
import Workspace from "../models/Workspace";
import User from "../models/User";
import Invitation from "../models/Invitation";
import { logActivity } from "../utils/logActivity";

const router = Router();
router.use(auth);

const validate = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
};

const nameRules = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Workspace name is required (max 100 chars)!"),
];

// Create workspace
router.post("/", nameRules, async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const workspace = await Workspace.create({
      name,
      description: description || "",
      owner: req.user.userId,
      members: [{ user: req.user.userId, role: "owner" }],
    });
    res.status(201).json(workspace);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// List user's workspaces
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const workspaces = await Workspace.find({ "members.user": req.user.userId })
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });
    res.json(workspaces);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Get workspace details
router.get("/:workspaceId", workspaceMember, async (req: Request, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate("members.user", "name email");
    res.json(workspace);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Update workspace
router.put("/:workspaceId", workspaceMember, workspaceRole("admin", "owner"), nameRules, async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      { name, ...(description !== undefined && { description }) },
      { new: true }
    ).populate("members.user", "name email");
    res.json(workspace);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Delete workspace
router.delete("/:workspaceId", workspaceMember, workspaceRole("owner"), async (req: Request, res: Response): Promise<void> => {
  try {
    await Workspace.findByIdAndDelete(req.params.workspaceId);
    res.json({ message: "Workspace deleted!" });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Invite member
router.post("/:workspaceId/invite", workspaceMember, workspaceRole("admin", "owner"), [
  body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email!"),
  body("role").optional().isIn(["admin", "member"]).withMessage("Role must be admin or member!"),
], async (req: Request, res: Response): Promise<void> => {
  if (!validate(req, res)) return;
  try {
    const { email, role } = req.body as { email: string; role?: string };
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found!" });
      return;
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const alreadyMember = workspace.members.some(
        (m) => m.user.toString() === existingUser._id.toString()
      );
      if (alreadyMember) {
        res.status(400).json({ error: "User is already a member!" });
        return;
      }
    }

    // Check if invitation already exists
    const existingInvite = await Invitation.findOne({
      workspace: workspace._id,
      email,
      status: "pending",
    });
    if (existingInvite) {
      res.status(400).json({ error: "Invitation already sent to this email!" });
      return;
    }

    const invitation = await Invitation.create({
      workspace: workspace._id,
      email,
      invitedBy: req.user.userId,
      role: role || "member",
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await logActivity({
      workspace: workspace._id,
      user: req.user.userId,
      action: "member_invited",
      metadata: { email, role: role || "member" },
    });

    res.status(201).json(invitation);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Change member role
router.put("/:workspaceId/members/:userId", workspaceMember, workspaceRole("admin", "owner"), async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body as { role: string };
    if (!["admin", "member"].includes(role)) {
      res.status(400).json({ error: "Role must be admin or member!" });
      return;
    }

    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found!" });
      return;
    }

    // Cannot change owner's role
    if (req.params.userId === workspace.owner.toString()) {
      res.status(400).json({ error: "Cannot change the owner's role!" });
      return;
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.params.userId
    );
    if (!member) {
      res.status(404).json({ error: "Member not found!" });
      return;
    }

    member.role = role as "admin" | "member";
    await workspace.save();

    const updated = await Workspace.findById(workspace._id)
      .populate("members.user", "name email");
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Remove member
router.delete("/:workspaceId/members/:userId", workspaceMember, workspaceRole("admin", "owner"), async (req: Request, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found!" });
      return;
    }

    if (req.params.userId === workspace.owner.toString()) {
      res.status(400).json({ error: "Cannot remove the workspace owner!" });
      return;
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await workspace.save();

    const updated = await Workspace.findById(workspace._id)
      .populate("members.user", "name email");
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
