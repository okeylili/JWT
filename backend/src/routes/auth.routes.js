import { Router } from "express";
import { login, logout, refresh, signup } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, signupSchema } from "../schemas/auth.schema.js";
import { redisRateLimit } from "../middlewares/rate-limit.middleware.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", redisRateLimit({ keyPrefix: "rl:login", max: 10, window: "1m" }), validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
