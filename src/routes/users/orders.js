import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
} from "../../controllers/User/OrderController.js";
import userAuth from "../../middlewares/userAuth.js";

const router = express.Router();

router.get("/", userAuth, getUserOrders);

router.get("/:id", userAuth, getOrderById);

router.post("/", userAuth, createOrder);

export default router;

