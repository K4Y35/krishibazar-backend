import express from "express";
import {
  getAllCategories
} from "../../controllers/Admin/CategoryController.js";

const router = express.Router();

router.get("/", getAllCategories);

export default router;

