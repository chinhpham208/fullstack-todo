import mongoose, { Schema, Model } from "mongoose";
import { ITodo } from "../types";

const todoSchema = new Schema<ITodo>({
  task:      { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  owner:     { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

const Todo: Model<ITodo> = mongoose.model<ITodo>("Todo", todoSchema);
export default Todo;
