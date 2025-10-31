import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/Admin/CategoryController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requirePermission from "../../middlewares/requirePermission.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.get(
  "/",
  adminAuth,
  requirePermission("category_management"),
  getAllCategories
);
router.get(
  "/:id",
  adminAuth,
  requirePermission("category_management"),
  getCategoryById
);
router.post(
  "/",
  adminAuth,
  requirePermission("category_management"),
  upload.single("icon"),
  createCategory
);
router.put(
  "/:id",
  adminAuth,
  requirePermission("category_management"),
  upload.single("icon"),
  updateCategory
);
router.delete(
  "/:id",
  adminAuth,
  requirePermission("category_management"),
  deleteCategory
);

export default router;
