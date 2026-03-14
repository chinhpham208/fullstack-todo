import { Schema, model } from "mongoose";
import type { IComment } from "../types";

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    card: { type: Schema.Types.ObjectId, ref: "Card", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default model<IComment>("Comment", commentSchema);
