import { Router } from "express";
import { z } from "zod";
import {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  signupHandler
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authRateLimiter } from "../middlewares/rate-limit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { passwordPolicy, passwordPolicyMessage } from "../utils/password-policy.js";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: z.string().regex(passwordPolicy.regex, passwordPolicyMessage)
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(passwordPolicy.minLength).max(128)
});
const passwordSchema = z.object({
  currentPassword: z.string().min(passwordPolicy.minLength).max(128),
  newPassword: z.string().regex(passwordPolicy.regex, passwordPolicyMessage)
});

router.post("/signup", authRateLimiter, validate(signupSchema), signupHandler);
router.post("/login", authRateLimiter, validate(loginSchema), loginHandler);
router.post("/refresh", authRateLimiter, refreshHandler);
router.post("/logout", requireAuth, logoutHandler);
router.post("/change-password", requireAuth, validate(passwordSchema), changePasswordHandler);

export default router;
