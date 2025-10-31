import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../../controllers/Admin/OrderController.js";
import adminAuth from "../../middlewares/adminAuth.js";
import requirePermission from '../../middlewares/requirePermission.js';

const router = express.Router();

router.get("/", adminAuth,requirePermission('order_management'), getAllOrders);

router.get("/:id", adminAuth,requirePermission('order_management'), getOrderById);
router.put("/:id", adminAuth,requirePermission('order_management'), updateOrder);
router.delete("/:id", adminAuth,requirePermission('order_management'), deleteOrder);

export default router;

