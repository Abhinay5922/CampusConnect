const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatAccess = require('../middleware/chatAccess');
const Message = require('../models/Message');
const User = require('../models/User');

// Save message with role validation
router.post('/', auth, chatAccess, async (req, res) => {
  try {
    const { text, conversationId, sender, receiver } = req.body;

    // Validate message text
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ message: 'Message too long (max 5000 characters)' });
    }

    // Validate sender matches authenticated user
    if (sender !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const msg = new Message({
      conversationId,
      sender,
      receiver,
      text: text.trim(),
      read: false
    });
    
    await msg.save();
    res.json(msg);
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation history between two users with role validation
router.get('/:userId1/:userId2', auth, chatAccess, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // Validate user is part of this conversation
    if (req.user.id !== userId1 && req.user.id !== userId2) {
      return res.status(403).json({ message: 'Unauthorized to view this conversation' });
    }

    const convId1 = `${userId1}_${userId2}`;
    const convId2 = `${userId2}_${userId1}`;
    
    const msgs = await Message.find({ 
      conversationId: { $in: [convId1, convId2] } 
    })
    .sort({ createdAt: 1 })
    .lean();
    
    res.json(msgs);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;
    const { senderId } = req.body; // The other user in the conversation

    // Mark all messages in this conversation as read where current user is receiver
    const result = await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    // Notify sender via socket that messages were read
    if (senderId && result.modifiedCount > 0) {
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      
      if (io && onlineUsers) {
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages-read', {
            conversationId,
            readBy: currentUserId,
            count: result.modifiedCount
          });
        }
      }
    }

    res.json({
      success: true,
      markedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total unread message count for current user
router.get('/unread/count', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      read: false
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get message statistics for debugging
router.get('/stats', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const [totalSent, totalReceived, unreadCount] = await Promise.all([
      Message.countDocuments({ sender: currentUserId }),
      Message.countDocuments({ receiver: currentUserId }),
      Message.countDocuments({ receiver: currentUserId, read: false })
    ]);

    res.json({
      totalSent,
      totalReceived,
      unreadCount,
      total: totalSent + totalReceived
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
