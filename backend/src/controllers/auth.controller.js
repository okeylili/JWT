import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { issueRefreshToken, rotateRefreshToken, signAccessToken } from "../services/token.service.js";
import { writeAuditLog } from "../services/audit.service.js";
import { redis } from "../config/redis.js";

function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: env.nodeEnv === "production",
    maxAge: maxAgeMs
  };
}

export async function signup(req, res) {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.status(409).json({ error: "Email already in use" });
  const passwordHash = await bcrypt.hash(req.body.password, env.bcryptRounds);
  const user = await User.create({ email: req.body.email, passwordHash });
  await writeAuditLog({ action: "signup", userId: user._id, ip: req.ip, userAgent: req.headers["user-agent"] || "" });
  return res.status(201).json({ id: user._id, email: user.email, role: user.role });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (user.isBanned) return res.status(403).json({ error: "Account is banned" });
  if (user.isLocked && user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    return res.status(423).json({ error: "Account locked. Try again later." });
  }
  const ok = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!ok) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    await writeAuditLog({ action: "login_failed", userId: user._id, ip: req.ip, userAgent: req.headers["user-agent"] || "" });
    return res.status(401).json({ error: "Invalid credentials" });
  }
  user.failedLoginAttempts = 0;
  user.isLocked = false;
  user.lockUntil = null;
  await user.save();
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, { ip: req.ip, userAgent: req.headers["user-agent"] || "" });
  res.cookie("refreshToken", refreshToken, cookieOptions(env.refreshTokenTtlDays * 24 * 60 * 60 * 1000));
  await writeAuditLog({ action: "login_success", userId: user._id, ip: req.ip, userAgent: req.headers["user-agent"] || "" });
  return res.json({ accessToken, user: { id: user._id, email: user.email, role: user.role } });
}

export async function refresh(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "Missing refresh token" });
    const { userId, token: newRefreshToken } = await rotateRefreshToken(token, {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || ""
    });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Invalid token user" });
    const accessToken = signAccessToken(user);
    res.cookie("refreshToken", newRefreshToken, cookieOptions(env.refreshTokenTtlDays * 24 * 60 * 60 * 1000));
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Refresh token invalid" });
  }
}

export async function logout(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (token) {
    const payload = jwt.decode(token);
    if (payload?.exp) {
      await redis.set(`bl:${token}`, "1", "EX", Math.max(1, payload.exp - Math.floor(Date.now() / 1000)));
    }
  }
  res.clearCookie("refreshToken");
  return res.json({ ok: true });
}
