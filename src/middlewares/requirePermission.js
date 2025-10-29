import { checkAdminPermission } from "../models/AdminRBAC.js";

/**
 * Middleware to check if admin has required permission
 * Usage: router.get('/path', adminAuth, requirePermission('permission_key'), handler)
 */
const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const admin = req.user;

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Superadmin has all permissions
      if (admin.username === "superadmin") {
        return next();
      }

      // Check if admin has the required permission
      const hasPermission = await checkAdminPermission(admin.id, permissionKey);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource",
          required_permission: permissionKey
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking permissions"
      });
    }
  };
};

export default requirePermission;
