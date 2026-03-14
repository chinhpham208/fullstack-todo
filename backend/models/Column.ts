import { Schema, model } from "mongoose";
import type { IColumn } from "../types";

const columnSchema = new Schema<IColumn>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  board: { type: Schema.Types.ObjectId, ref: "Board", required: true },
  position: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

columnSchema.index({ board: 1, position: 1 });

export default model<IColumn>("Column", columnSchema);
