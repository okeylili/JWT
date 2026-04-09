export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.auth || !allowedRoles.includes(req.auth.role)) {
    return res.status(403).json({ message: "Insufficient role" });
  }
  return next();
};

export const requirePermission = (...permissions) => (req, res, next) => {
  const granted = req.auth?.permissions || [];
  const missing = permissions.some((permission) => !granted.includes(permission));
  if (missing) return res.status(403).json({ message: "Missing required permission" });
  return next();
};
