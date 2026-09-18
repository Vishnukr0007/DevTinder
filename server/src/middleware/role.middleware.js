/**
 * Role-Based Access Control (RBAC) middleware
 * Example: authorize("ADMIN"), authorize("ADMIN", "MODERATOR")
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || "GUEST"}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

export const requireAdmin = authorize("ADMIN");
export const requireModerator = authorize("ADMIN", "MODERATOR");
