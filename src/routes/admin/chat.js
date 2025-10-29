import express from 'express';
import * as ChatModel from '../../models/Chat.js';
import adminAuth from '../../middlewares/adminAuth.js';

const router = express.Router();

// Get all messages (admins can see all user messages)
router.get('/messages', adminAuth, async (req, res) => {
  try {
    const filters = {};
    
    const messages = await ChatModel.getAllMessages(filters);
    
    res.json({
      success: true,
      data: messages.reverse(), // Show oldest first
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
});

// Get messages for a specific user
router.get('/messages/user/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const filters = {
      user_id: parseInt(userId),
    };
    
    const messages = await ChatModel.getAllMessages(filters);
    
    res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
});

// Mark messages as read for a specific user
router.put('/messages/user/:userId/read', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mark all unread messages from this user as read
    const { runUpdateSqlQuery } = await import('../../db/sqlfunction.js');
    await runUpdateSqlQuery(
      `UPDATE chat_messages SET is_read = true WHERE sender_id = ? AND sender_type = 'user' AND is_read = false`,
      [parseInt(userId)]
    );
    
    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message,
    });
  }
});

export default router;

