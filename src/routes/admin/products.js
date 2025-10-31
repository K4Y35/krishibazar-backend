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
import requirePermission from '../../middlewares/requirePermission.js';

const router = express.Router();

router.get("/", adminAuth,requirePermission('product_management'), getAllProducts);
router.get("/:id", adminAuth,requirePermission('product_management'), getProductById);

router.post("/", adminAuth,requirePermission('product_management'), upload.fields([
  { name: 'product_image', maxCount: 5 }
]), createProduct);

router.put("/:id", adminAuth,requirePermission('product_management'), upload.fields([
  { name: 'product_image', maxCount: 5 }
]), updateProduct);

router.delete("/:id", adminAuth,requirePermission('product_management'), deleteProduct);

export default router;


