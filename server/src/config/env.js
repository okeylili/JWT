import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/secureauth?schema=public"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32).default("dev_access_secret_change_me_1234567890"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev_refresh_secret_change_me_1234567890"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.string().default("14"),
  BCRYPT_ROUNDS: z.string().default("12"),
  CSRF_COOKIE_NAME: z.string().default("_csrf")
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables.");
}

export const env = parsed.data;
