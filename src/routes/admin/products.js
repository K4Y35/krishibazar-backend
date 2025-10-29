import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/Admin/ProductController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

// ============ PRODUCTS ============
// Get all products with filters (any authenticated admin)
router.get("/", adminAuth, getAllProducts);

// Get product by ID (any authenticated admin)
router.get("/:id", adminAuth, getProductById);

// Create new product (any authenticated admin with product_management permission)
router.post("/", adminAuth, upload.fields([
  { name: 'product_image', maxCount: 5 }
]), createProduct);

// Update product (any authenticated admin with product_management permission)
router.put("/:id", adminAuth, upload.fields([
  { name: 'product_image', maxCount: 5 }
]), updateProduct);

// Delete product (any authenticated admin with product_management permission)
router.delete("/:id", adminAuth, deleteProduct);

export default router;


