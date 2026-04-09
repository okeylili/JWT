import { prisma } from "../config/prisma.js";
import { createAuditLog } from "./audit.service.js";

export const listUsers = () =>
  prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      failedLoginAttempts: true,
      lockUntil: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

export const updateUserRole = async ({ actorUserId, targetUserId, role, ipAddress }) => {
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { role } });
  await createAuditLog({
    action: "ROLE_UPDATED",
    details: `${targetUserId} => ${role}`,
    actorUserId,
    ipAddress
  });
  return user;
};

export const unlockUser = async ({ actorUserId, targetUserId, ipAddress }) => {
  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { failedLoginAttempts: 0, lockUntil: null }
  });
  await createAuditLog({
    action: "ACCOUNT_UNLOCKED",
    details: targetUserId,
    actorUserId,
    ipAddress
  });
  return user;
};

export const listAuditLogs = () =>
  prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 300
  });
