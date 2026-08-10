/**
 * Usage: router.get('/reports', authMiddleware, requireRole('admin', 'manager'), handler)
 * Must run AFTER authMiddleware, which populates req.roles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.roles || [];
    const isAllowed = userRoles.some((role) => allowedRoles.includes(role));

    if (!isAllowed) {
      return res.status(403).json({
        error: 'You do not have permission to perform this action',
      });
    }

    return next();
  };
}
