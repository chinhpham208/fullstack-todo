import Activity from "../models/Activity";
import type { ActivityAction } from "../types";
import type { Types } from "mongoose";

interface LogActivityParams {
  workspace: Types.ObjectId;
  user: string;
  action: ActivityAction;
  board?: Types.ObjectId;
  card?: Types.ObjectId;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await Activity.create({
      workspace: params.workspace,
      board: params.board,
      card: params.card,
      user: params.user,
      action: params.action,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
