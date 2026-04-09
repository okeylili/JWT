import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { generateTokenId, hashToken } from "../utils/crypto.js";
import { RefreshToken } from "../models/RefreshToken.js";

export function signAccessToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl
  });
}

export async function issueRefreshToken(user, reqMeta) {
  const tokenId = generateTokenId();
  const token = jwt.sign({ sub: String(user._id), jti: tokenId }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTokenTtlDays}d`
  });
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: user._id,
    tokenId,
    tokenHash: hashToken(token),
    expiresAt,
    createdByIp: reqMeta.ip,
    userAgent: reqMeta.userAgent
  });
  return token;
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

export async function rotateRefreshToken(oldToken, reqMeta) {
  const payload = verifyRefreshToken(oldToken);
  const existing = await RefreshToken.findOne({ tokenId: payload.jti });
  if (!existing) throw new Error("Refresh token not found");
  if (existing.revokedAt) throw new Error("Refresh token already revoked");
  if (existing.tokenHash !== hashToken(oldToken)) throw new Error("Refresh token mismatch");
  if (existing.expiresAt.getTime() <= Date.now()) throw new Error("Refresh token expired");

  const newTokenId = generateTokenId();
  const newToken = jwt.sign({ sub: payload.sub, jti: newTokenId }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTokenTtlDays}d`
  });
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: payload.sub,
    tokenId: newTokenId,
    tokenHash: hashToken(newToken),
    expiresAt,
    createdByIp: reqMeta.ip,
    userAgent: reqMeta.userAgent
  });
  existing.revokedAt = new Date();
  existing.replacedByTokenId = newTokenId;
  await existing.save();
  return { userId: payload.sub, token: newToken };
}
