import { Schema, model } from "mongoose";
import type { IActivity } from "../types";

const activitySchema = new Schema<IActivity>({
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  board: { type: Schema.Types.ObjectId, ref: "Board" },
  card: { type: Schema.Types.ObjectId, ref: "Card" },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: {
    type: String,
    enum: [
      "card_created", "card_moved", "card_updated", "card_deleted",
      "comment_added", "member_invited", "member_joined",
      "column_created", "column_deleted", "board_created",
    ],
    required: true,
  },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

activitySchema.index({ workspace: 1, createdAt: -1 });

export default model<IActivity>("Activity", activitySchema);
