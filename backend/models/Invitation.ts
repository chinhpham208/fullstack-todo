import { Schema, model } from "mongoose";
import type { IInvitation } from "../types";

const invitationSchema = new Schema<IInvitation>({
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

invitationSchema.index({ email: 1, workspace: 1 });

export default model<IInvitation>("Invitation", invitationSchema);
