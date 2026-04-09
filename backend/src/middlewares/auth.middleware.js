import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { redis } from "../config/redis.js";
import { ROLE_PERMISSIONS } from "../utils/permissions.js";

export async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing access token" });
    const isBlacklisted = await redis.get(`bl:${token}`);
    if (isBlacklisted) return res.status(401).json({ error: "Token revoked" });
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    const perms = ROLE_PERMISSIONS[req.user.role] || [];
    if (!perms.includes(permission)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}
