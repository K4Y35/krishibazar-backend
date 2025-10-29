import express from "express";
import {
  approveUser,
  getAllUsers,
  getUserDetails,
} from "../../controllers/Admin/UsersController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requirePermission from "../../middlewares/requirePermission.js";

const router = express.Router();

router.get(
  "/all-users",
  adminAuth,
  requirePermission("manage_users"),
  getAllUsers
);
router.get(
  "/details/:id",
  adminAuth,
  requirePermission("manage_users"),
  getUserDetails
);
router.get(
  "/approve/:id",
  adminAuth,
  requirePermission("manage_users"),
  approveUser
);

export default router;
