import { AuditLog } from "../models/AuditLog.js";

export async function writeAuditLog(data) {
  await AuditLog.create(data);
}
