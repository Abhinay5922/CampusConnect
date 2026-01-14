const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user with id field for compatibility
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      batch: user.batch,
      lastSeen: user.lastSeen
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online status for multiple users
router.post('/online-status', auth, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'userIds array required' });
    }

    // Get online users from server (we'll need to expose this)
    const onlineUsers = req.app.get('onlineUsers') || new Map();
    
    const statusMap = {};
    userIds.forEach(userId => {
      statusMap[userId] = onlineUsers.has(userId);
    });

    res.json(statusMap);
  } catch (err) {
    console.error('Get online status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
