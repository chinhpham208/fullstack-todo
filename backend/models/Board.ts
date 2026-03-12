import { Schema, model } from "mongoose";
import type { IBoard } from "../types";

const boardSchema = new Schema<IBoard>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IBoard>("Board", boardSchema);
