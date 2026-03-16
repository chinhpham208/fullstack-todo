import { Schema, model } from "mongoose";
import type { ICard, IReaction } from "../types";

const reactionSchema = new Schema<IReaction>({
  emoji: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const cardSchema = new Schema<ICard>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    column: { type: Schema.Types.ObjectId, ref: "Column", required: true },
    board: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    position: { type: Number, required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completed: { type: Boolean, default: false },
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

cardSchema.index({ column: 1, position: 1 });
cardSchema.index({ board: 1 });

export default model<ICard>("Card", cardSchema);
