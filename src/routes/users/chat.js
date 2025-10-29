import express from "express";
import * as ChatModel from "../../models/Chat.js";
import userAuth from "../../middlewares/userAuth.js";

const router = express.Router();

// Get chat messages
router.get("/messages", userAuth, async (req, res) => {
  try {
    // Get all messages for this user (both sent and received)
    // Messages where user is sender OR where user is receiver
    let query = `
      SELECT cm.*,
             u.first_name as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE (cm.sender_id = ? OR cm.receiver_id = ?)
      ORDER BY cm.created_at ASC
    `;
    
    const { runSelectSqlQuery } = await import("../../db/sqlfunction.js");
    const messages = await runSelectSqlQuery(query, [req.user.id, req.user.id]);
    
    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// Create chat message
router.post("/messages", userAuth, async (req, res) => {
  try {
    const { message, receiver_id } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const messageData = {
      sender_id: req.user.id,
      sender_type: "user",
      receiver_id: receiver_id || null,
      message: message.trim(),
    };

    const result = await ChatModel.createMessage(messageData);
    const newMessage = await ChatModel.getAllMessages({ id: result.insertId });

    res.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage[0],
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Mark messages as read
router.put("/messages/read", userAuth, async (req, res) => {
  try {
    const { message_id } = req.body;

    if (message_id) {
      await ChatModel.markAsRead(message_id);
    } else {
      await ChatModel.markAllAsRead(req.user.id, null);
    }

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
});

// Get unread count
router.get("/unread", userAuth, async (req, res) => {
  try {
    const count = await ChatModel.getUnreadCount(req.user.id);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
});

export default router;

