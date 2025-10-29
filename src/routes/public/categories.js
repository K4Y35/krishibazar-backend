import express from "express";
import {
  getAllCategories
} from "../../controllers/Admin/CategoryController.js";

const router = express.Router();

// Get all active categories (public access)
router.get("/", getAllCategories);

export default router;

