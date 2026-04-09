import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { rolePermissions } from "../models/permissions.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/tokens.js";
import { createAuditLog } from "./audit.service.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const refreshExpiryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + Number(env.REFRESH_TOKEN_TTL_DAYS));
  return d;
};

export const signup = async ({ email, name, password, ipAddress }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
  const passwordHash = await bcrypt.hash(password, Number(env.BCRYPT_ROUNDS));
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: "USER" }
  });
  await createAuditLog({ action: "SIGNUP", actorUserId: user.id, ipAddress });
  return user;
};

export const login = async ({ email, password, ipAddress, userAgent }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw Object.assign(new Error("Account is temporarily locked"), { statusCode: 423 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const failed = user.failedLoginAttempts + 1;
    const lockUntil = failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: failed, lockUntil }
    });
    await createAuditLog({ action: "LOGIN_FAILED", actorUserId: user.id, ipAddress });
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockUntil: null }
  });

  const permissions = rolePermissions[user.role];
  const { token: accessToken, jti } = signAccessToken({
    sub: user.id,
    role: user.role,
    permissions
  });
  const refreshToken = signRefreshToken({ sub: user.id, family: crypto.randomUUID() });
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      family: verifyRefreshToken(refreshToken).family,
      userId: user.id,
      expiresAt: refreshExpiryDate(),
      userAgent,
      ipAddress
    }
  });
  await createAuditLog({ action: "LOGIN_SUCCESS", actorUserId: user.id, ipAddress });
  return { user, accessToken, refreshToken, jti, permissions };
};

export const rotateRefreshToken = async ({ refreshToken, ipAddress, userAgent }) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw Object.assign(new Error("Refresh token invalid or reused"), { statusCode: 401 });
  }
  const tokenHash = hashToken(refreshToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    if (decoded?.sub) {
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.sub, family: decoded.family, revokedAt: null },
        data: { revokedAt: new Date(), isReused: true }
      });
    }
    throw Object.assign(new Error("Refresh token invalid or reused"), { statusCode: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  const permissions = rolePermissions[user.role];
  const { token: newAccessToken, jti } = signAccessToken({
    sub: user.id,
    role: user.role,
    permissions
  });
  const newRefreshToken = signRefreshToken({ sub: user.id, family: existing.family });
  const newHash = hashToken(newRefreshToken);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedById: newHash }
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        family: existing.family,
        userId: user.id,
        expiresAt: refreshExpiryDate(),
        userAgent,
        ipAddress
      }
    })
  ]);

  return { user, newAccessToken, newRefreshToken, jti, permissions };
};

export const logout = async ({ accessJti, refreshToken, userId, ipAddress }) => {
  if (accessJti) {
    await prisma.blacklistedToken.create({
      data: {
        jti: accessJti,
        expiresAt: new Date(Date.now() + 15 * 60_000)
      }
    });
  }
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }
  await createAuditLog({ action: "LOGOUT", actorUserId: userId, ipAddress });
};

export const changePassword = async ({ userId, currentPassword, newPassword, ipAddress }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw Object.assign(new Error("Current password is incorrect"), { statusCode: 400 });
  const passwordHash = await bcrypt.hash(newPassword, Number(env.BCRYPT_ROUNDS));
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await createAuditLog({ action: "PASSWORD_CHANGED", actorUserId: userId, ipAddress });
};
