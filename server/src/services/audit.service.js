import { prisma } from "../config/prisma.js";

export const createAuditLog = async ({ action, details, actorUserId, ipAddress }) => {
  await prisma.auditLog.create({
    data: { action, details, actorUserId, ipAddress }
  });
};
