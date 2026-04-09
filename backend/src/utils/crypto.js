import crypto from "crypto";

export function hashToken(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateTokenId() {
  return crypto.randomUUID();
}
