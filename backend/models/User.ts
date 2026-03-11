import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types";

const userSchema = new Schema<IUser>({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
