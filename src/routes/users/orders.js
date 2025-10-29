import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
} from "../../controllers/User/OrderController.js";
import userAuth from "../../middlewares/userAuth.js";

const router = express.Router();

// Get user's orders
router.get("/", userAuth, getUserOrders);

// Get order by ID
router.get("/:id", userAuth, getOrderById);

// Create new order
router.post("/", userAuth, createOrder);

export default router;

