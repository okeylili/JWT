import { Router } from "express";
import { z } from "zod";
import {
  getAuditLogsHandler,
  getUsersHandler,
  unlockAccountHandler,
  updateRoleHandler
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requirePermission, requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();
const roleSchema = z.object({ role: z.enum(["ADMIN", "USER", "MODERATOR"]) });

router.use(requireAuth);
router.use(requireRole("ADMIN", "MODERATOR"));

router.get("/users", requirePermission("users:read"), getUsersHandler);
router.patch("/users/:userId/role", requirePermission("users:update-role"), validate(roleSchema), updateRoleHandler);
router.patch("/users/:userId/unlock", requirePermission("users:unlock"), unlockAccountHandler);
router.get("/logs", requirePermission("logs:read"), getAuditLogsHandler);

export default router;
