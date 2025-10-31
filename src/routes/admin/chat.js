import express from "express";
import adminAuth from "../../middlewares/adminAuth.js";
import {
  getMessages,
  getUserMessages,
  markUserMessagesRead,
} from "../../controllers/Admin/ChatController.js";

const router = express.Router();

router.get("/messages", adminAuth, getMessages);

router.get("/messages/user/:userId", adminAuth, getUserMessages);

router.put("/messages/user/:userId/read", adminAuth, markUserMessagesRead);

export default router;
