/**
 * Middleware to check if admin is superadmin
 * Usage: router.post('/rbac/roles', adminAuth, requireSuperAdmin, handler)
 */
const requireSuperAdmin = (req, res, next) => {
  try {
    const admin = req.user;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (admin.username !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can perform this action"
      });
    }

    next();
  } catch (error) {
    console.error("Super admin check error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking admin privileges"
    });
  }
};

export default requireSuperAdmin;

