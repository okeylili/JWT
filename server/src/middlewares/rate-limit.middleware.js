import rateLimit from "express-rate-limit";
import { redis } from "../config/redis.js";

const makeRedisStore = (prefix) => ({
  async increment(key) {
    const fullKey = `${prefix}:${key}`;
    const totalHits = await redis.incr(fullKey);
    if (totalHits === 1) await redis.expire(fullKey, 60);
    const timeToExpire = await redis.ttl(fullKey);
    return {
      totalHits,
      resetTime: new Date(Date.now() + Math.max(timeToExpire, 1) * 1000)
    };
  },
  async decrement(key) {
    const fullKey = `${prefix}:${key}`;
    await redis.decr(fullKey);
  },
  async resetKey(key) {
    const fullKey = `${prefix}:${key}`;
    await redis.del(fullKey);
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:auth")
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore("rl:api")
});
