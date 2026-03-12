import { Router, Request, Response } from "express";
import auth from "../middleware/auth";
import Invitation from "../models/Invitation";
import Workspace from "../models/Workspace";
import { logActivity } from "../utils/logActivity";

const router = Router();
router.use(auth);

// Get pending invitations for current user's email
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user's email from the auth middleware
    const User = (await import("../models/User")).default;
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const invitations = await Invitation.find({
      email: user.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("workspace", "name description")
      .populate("invitedBy", "name email");

    res.json(invitations);
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Accept invitation
router.post("/:invitationId/accept", async (req: Request, res: Response): Promise<void> => {
  try {
    const User = (await import("../models/User")).default;
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const invitation = await Invitation.findOne({
      _id: req.params.invitationId,
      email: user.email,
      status: "pending",
    });
    if (!invitation) {
      res.status(404).json({ error: "Invitation not found or expired!" });
      return;
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "declined";
      await invitation.save();
      res.status(400).json({ error: "Invitation has expired!" });
      return;
    }

    // Add user to workspace
    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) {
      res.status(404).json({ error: "Workspace no longer exists!" });
      return;
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (!alreadyMember) {
      workspace.members.push({
        user: user._id,
        role: invitation.role === "owner" ? "member" : invitation.role,
        joinedAt: new Date(),
      });
      await workspace.save();
    }

    invitation.status = "accepted";
    await invitation.save();

    await logActivity({
      workspace: workspace._id,
      user: req.user.userId,
      action: "member_joined",
      metadata: { name: user.name, email: user.email },
    });

    const populated = await Workspace.findById(workspace._id)
      .populate("members.user", "name email");
    res.json({ message: "Invitation accepted!", workspace: populated });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

// Decline invitation
router.post("/:invitationId/decline", async (req: Request, res: Response): Promise<void> => {
  try {
    const User = (await import("../models/User")).default;
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const invitation = await Invitation.findOne({
      _id: req.params.invitationId,
      email: user.email,
      status: "pending",
    });
    if (!invitation) {
      res.status(404).json({ error: "Invitation not found!" });
      return;
    }

    invitation.status = "declined";
    await invitation.save();

    res.json({ message: "Invitation declined." });
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
});

export default router;
