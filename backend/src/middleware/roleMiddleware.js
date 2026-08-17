/**
 * Usage: router.get('/reports', authMiddleware, requireRole('admin', 'manager'), handler)
 * Must run AFTER authMiddleware, which populates req.roles.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = req.roles || [];
    
    // DEBUG: Log the role check
    console.log('[roleMiddleware] Checking roles:', {
      userRoles,
      allowedRoles,
      userId: req.user?.id
    });
    
    const isAllowed = userRoles.some((role) => allowedRoles.includes(role));

    if (!isAllowed) {
      console.log('[roleMiddleware] ACCESS DENIED - User roles:', userRoles, 'Required:', allowedRoles);
      return res.status(403).json({
        error: 'You do not have permission to perform this action',
      });
    }

    console.log('[roleMiddleware] ACCESS GRANTED');
    return next();
  };
}

// Export as both names for compatibility
export const authorize = requireRole;
