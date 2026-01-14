const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    // Group by conversation partner
    const conversationMap = new Map();
    
    for (const msg of messages) {
      const partnerId = msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      
      // SKIP SELF-CONVERSATIONS
      if (partnerId === userId) continue;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          lastMessage: msg,
          messages: [msg]
        });
      } else {
        conversationMap.get(partnerId).messages.push(msg);
      }
    }

    // Build response
    const conversations = [];
    
    for (const [partnerId, data] of conversationMap) {
      const partner = await User.findById(partnerId).select('name role department batch');
      
      // VALIDATE OPPOSITE ROLE - skip if same role
      if (!partner || partner.role === currentUser.role) continue;

      // Count unread messages
      const unreadCount = data.messages.filter(
        m => m.receiver.toString() === userId && !m.read
      ).length;

      conversations.push({
        _id: data.lastMessage.conversationId,
        otherUser: {
          _id: partner._id,
          name: partner.name,
          role: partner.role,
          department: partner.department,
          batch: partner.batch
        },
        lastMessage: {
          text: data.lastMessage.text,
          sender: data.lastMessage.sender,
          createdAt: data.lastMessage.createdAt
        },
        unreadCount,
        updatedAt: data.lastMessage.createdAt
      });
    }

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(conversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
