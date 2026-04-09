import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";

export async function listUsers(_req, res) {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json(users);
}

export async function updateUserRole(req, res) {
  const user = await User.findByIdAndUpdate(req.params.userId, { role: req.body.role }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
}

export async function unlockUser(req, res) {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isLocked: false, lockUntil: null, failedLoginAttempts: 0 },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
}

export async function banUser(req, res) {
  const user = await User.findByIdAndUpdate(req.params.userId, { isBanned: true }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
}

export async function listAuditLogs(_req, res) {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
  res.json(logs);
}
