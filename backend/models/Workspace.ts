import { Schema, model } from "mongoose";
import type { IWorkspace } from "../types";

const workspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

workspaceSchema.index({ "members.user": 1 });

export default model<IWorkspace>("Workspace", workspaceSchema);
