import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../controllers/Admin/CategoryController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requirePermission from "../../middlewares/requirePermission.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

// Get all categories (any authenticated admin)
router.get("/", adminAuth, getAllCategories);

// Get category by ID (any authenticated admin)
router.get("/:id", adminAuth, getCategoryById);

// Create new category (admin with project_management permission)
router.post("/", adminAuth, requirePermission('project_management'), upload.single('icon'), createCategory);

// Update category (admin with project_management permission)
router.put("/:id", adminAuth, requirePermission('project_management'), upload.single('icon'), updateCategory);

// Delete category (admin with project_management permission)
router.delete("/:id", adminAuth, requirePermission('project_management'), deleteCategory);

export default router;

