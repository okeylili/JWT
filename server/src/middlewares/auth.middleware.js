import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing access token" });

  try {
    const decoded = verifyAccessToken(token);
    const blacklisted = await prisma.blacklistedToken.findUnique({ where: { jti: decoded.jti } });
    if (blacklisted) return res.status(401).json({ message: "Token revoked" });
    req.auth = {
      userId: decoded.sub,
      role: decoded.role,
      permissions: decoded.permissions || [],
      jti: decoded.jti
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
