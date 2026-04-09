import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = ({ sub, role, permissions }) => {
  const jti = crypto.randomUUID();
  return {
    token: jwt.sign({ role, permissions, jti }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.ACCESS_TOKEN_TTL,
      subject: sub
    }),
    jti
  };
};

export const signRefreshToken = ({ sub, family }) =>
  jwt.sign({ family }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
    subject: sub
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
