export const rolePermissions = {
  ADMIN: ["users:read", "users:update-role", "users:unlock", "logs:read"],
  MODERATOR: ["users:read", "users:unlock", "logs:read"],
  USER: []
};
