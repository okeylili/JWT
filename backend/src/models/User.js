import mongoose from "mongoose";
import { ROLES } from "../utils/permissions.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
