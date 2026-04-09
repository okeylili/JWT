export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator"
};

export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_UPDATE_ROLE: "users:update-role",
  USERS_BAN: "users:ban",
  USERS_UNLOCK: "users:unlock",
  AUDIT_READ: "audit:read",
  PROFILE_READ: "profile:read"
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MODERATOR]: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_BAN, PERMISSIONS.AUDIT_READ],
  [ROLES.USER]: [PERMISSIONS.PROFILE_READ]
};
