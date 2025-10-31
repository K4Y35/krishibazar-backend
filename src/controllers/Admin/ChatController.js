import * as ChatModel from "../../models/Chat.js";
import { runUpdateSqlQuery } from "../../db/sqlfunction.js";

export const getMessages = async (req, res) => {
  try {
    const filters = {};
    const messages = await ChatModel.getAllMessages(filters);
    return res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = { user_id: parseInt(userId) };
    const messages = await ChatModel.getAllMessages(filters);
    return res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

export const markUserMessagesRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await runUpdateSqlQuery(
      `UPDATE chat_messages SET is_read = true WHERE sender_id = ? AND sender_type = 'user' AND is_read = false`,
      [parseInt(userId)]
    );
    return res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};


