import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { listAuditLogs, listUsers, unlockUser, updateUserRole } from "../services/admin.service.js";

export const getUsersHandler = asyncHandler(async (req, res) => {
  const users = await listUsers();
  res.status(200).json(users);
});

export const updateRoleHandler = asyncHandler(async (req, res) => {
  const user = await updateUserRole({
    actorUserId: req.auth.userId,
    targetUserId: req.params.userId,
    role: req.validatedBody.role,
    ipAddress: req.ip
  });
  res.status(200).json(user);
});

export const unlockAccountHandler = asyncHandler(async (req, res) => {
  const user = await unlockUser({
    actorUserId: req.auth.userId,
    targetUserId: req.params.userId,
    ipAddress: req.ip
  });
  res.status(200).json(user);
});

export const getAuditLogsHandler = asyncHandler(async (req, res) => {
  const logs = await listAuditLogs();
  res.status(200).json(logs);
});
