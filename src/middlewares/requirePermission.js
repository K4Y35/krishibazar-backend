import { checkAdminPermission } from "../models/AdminRBAC.js";

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

      if (admin.username === "superadmin") {
        return next();
      }

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
