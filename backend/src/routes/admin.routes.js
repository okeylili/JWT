import { Router } from "express";
import { banUser, listAuditLogs, listUsers, unlockUser, updateUserRole } from "../controllers/admin.controller.js";
import { requireAuth, requirePermission } from "../middlewares/auth.middleware.js";
import { PERMISSIONS } from "../utils/permissions.js";

const router = Router();
router.use(requireAuth);

router.get("/users", requirePermission(PERMISSIONS.USERS_READ), listUsers);
router.patch("/users/:userId/role", requirePermission(PERMISSIONS.USERS_UPDATE_ROLE), updateUserRole);
router.patch("/users/:userId/unlock", requirePermission(PERMISSIONS.USERS_UNLOCK), unlockUser);
router.patch("/users/:userId/ban", requirePermission(PERMISSIONS.USERS_BAN), banUser);
router.get("/audit-logs", requirePermission(PERMISSIONS.AUDIT_READ), listAuditLogs);

export default router;
