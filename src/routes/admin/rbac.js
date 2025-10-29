import express from "express";
import * as RBACController from "../../controllers/Admin/RBACController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requireSuperAdmin from "../../middlewares/requireSuperAdmin.js";

const router = express.Router();

// ============ PERMISSIONS ============
router.get("/permissions", adminAuth, requireSuperAdmin, RBACController.getAllPermissions);
router.post("/permissions", adminAuth, requireSuperAdmin, RBACController.createPermission);
router.put("/permissions/:id", adminAuth, requireSuperAdmin, RBACController.updatePermission);
router.delete("/permissions/:id", adminAuth, requireSuperAdmin, RBACController.deletePermission);

// ============ ROLES ============
router.get("/roles", adminAuth, requireSuperAdmin, RBACController.getAllRoles);
router.get("/roles/:id", adminAuth, requireSuperAdmin, RBACController.getRoleById);
router.post("/roles", adminAuth, requireSuperAdmin, RBACController.createRole);
router.put("/roles/:id", adminAuth, requireSuperAdmin, RBACController.updateRole);
router.delete("/roles/:id", adminAuth, requireSuperAdmin, RBACController.deleteRole);

// ============ ADMINS ============
router.get("/admins", adminAuth, requireSuperAdmin, RBACController.getAllAdmins);
router.get("/admins/:id", adminAuth, requireSuperAdmin, RBACController.getAdminById);
router.post("/admins", adminAuth, requireSuperAdmin, RBACController.createAdmin);
router.put("/admins/:id/roles", adminAuth, requireSuperAdmin, RBACController.updateAdminRoles);
router.put("/admins/:id/permissions", adminAuth, requireSuperAdmin, RBACController.updateAdminPermissions);

// ============ MY PERMISSIONS (any authenticated admin) ============
router.get("/me/permissions", adminAuth, RBACController.getMyPermissions);

export default router;

