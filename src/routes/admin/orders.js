import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../../controllers/Admin/OrderController.js";
import adminAuth from "../../middlewares/adminAuth.js";

const router = express.Router();

// Get all orders (any authenticated admin)
router.get("/", adminAuth, getAllOrders);

// Get order by ID (any authenticated admin)
router.get("/:id", adminAuth, getOrderById);

// Update order (any authenticated admin)
router.put("/:id", adminAuth, updateOrder);

// Delete order (any authenticated admin)
router.delete("/:id", adminAuth, deleteOrder);

export default router;

