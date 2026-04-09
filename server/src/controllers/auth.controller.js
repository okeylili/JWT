import { env } from "../config/env.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { changePassword, login, logout, rotateRefreshToken, signup } from "../services/auth.service.js";

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: Number(env.REFRESH_TOKEN_TTL_DAYS) * 24 * 60 * 60 * 1000
  });
};

export const signupHandler = asyncHandler(async (req, res) => {
  const user = await signup({ ...req.validatedBody, ipAddress: req.ip });
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const result = await login({
    ...req.validatedBody,
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({
    accessToken: result.accessToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      permissions: result.permissions
    }
  });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const currentToken = req.cookies.refreshToken;
  if (!currentToken) return res.status(401).json({ message: "Missing refresh token" });
  const rotated = await rotateRefreshToken({
    refreshToken: currentToken,
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });
  setRefreshCookie(res, rotated.newRefreshToken);
  return res.status(200).json({
    accessToken: rotated.newAccessToken,
    user: {
      id: rotated.user.id,
      email: rotated.user.email,
      role: rotated.user.role,
      permissions: rotated.permissions
    }
  });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  await logout({
    accessJti: req.auth?.jti,
    refreshToken: req.cookies.refreshToken,
    userId: req.auth?.userId,
    ipAddress: req.ip
  });
  res.clearCookie("refreshToken", { path: "/api/auth" });
  return res.status(200).json({ message: "Logged out" });
});

export const changePasswordHandler = asyncHandler(async (req, res) => {
  await changePassword({
    userId: req.auth.userId,
    currentPassword: req.validatedBody.currentPassword,
    newPassword: req.validatedBody.newPassword,
    ipAddress: req.ip
  });
  return res.status(200).json({ message: "Password updated" });
});
