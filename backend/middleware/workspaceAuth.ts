import { Request, Response, NextFunction } from "express";
import Workspace from "../models/Workspace";
import Board from "../models/Board";
import Card from "../models/Card";
import type { MemberRole } from "../types";

// Check if user is a member of the workspace (from req.params.workspaceId)
export const workspaceMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found!" });
      return;
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.user.userId
    );
    if (!member) {
      res.status(403).json({ error: "You are not a member of this workspace!" });
      return;
    }

    req.workspace = workspace;
    req.memberRole = member.role;
    next();
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
};

// Check if user has required role(s)
export const workspaceRole = (...roles: MemberRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.memberRole || !roles.includes(req.memberRole)) {
      res.status(403).json({ error: "You don't have permission for this action!" });
      return;
    }
    next();
  };
};

// Extract workspace from board (for routes like /boards/:boardId/...)
export const workspaceFromBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    const workspace = await Workspace.findById(board.workspace);
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found!" });
      return;
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.user.userId
    );
    if (!member) {
      res.status(403).json({ error: "You are not a member of this workspace!" });
      return;
    }

    req.workspace = workspace;
    req.memberRole = member.role;
    req.board = board;
    next();
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
};

// Extract workspace from card (for routes like /cards/:cardId/...)
export const workspaceFromCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) {
      res.status(404).json({ error: "Card not found!" });
      return;
    }

    const board = await Board.findById(card.board);
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    const workspace = await Workspace.findById(board.workspace);
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found!" });
      return;
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.user.userId
    );
    if (!member) {
      res.status(403).json({ error: "You are not a member of this workspace!" });
      return;
    }

    req.workspace = workspace;
    req.memberRole = member.role;
    req.board = board;
    req.card = card;
    next();
  } catch {
    res.status(500).json({ error: "Server error, please try again." });
  }
};
