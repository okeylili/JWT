import { redis } from "../config/redis.js";

function secondsFromWindow(window) {
  if (window.endsWith("m")) return Number(window.slice(0, -1)) * 60;
  if (window.endsWith("h")) return Number(window.slice(0, -1)) * 3600;
  return Number(window);
}

export function redisRateLimit({ keyPrefix, max, window }) {
  const ttl = secondsFromWindow(window);
  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.ip}`;
    const current = await redis.incr(key);
    if (current === 1) await redis.expire(key, ttl);
    if (current > max) return res.status(429).json({ error: "Too many requests" });
    return next();
  };
}
