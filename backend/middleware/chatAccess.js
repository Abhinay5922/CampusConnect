const User = require('../models/User');

const validateChatAccess = async (req, res, next) => {
  try {
    // Get current user from auth middleware
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get other user ID from params or body
    const otherUserId = req.params.otherId || req.params.userId2 || req.body.receiver;
    
    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID required' });
    }

    // PREVENT SELF-MESSAGING
    if (req.user.id === otherUserId) {
      return res.status(403).json({ message: 'You cannot message yourself' });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if roles are the same - REJECT if same role
    if (currentUser.role === otherUser.role) {
      return res.status(403).json({ 
        message: `You can only chat with ${currentUser.role === 'student' ? 'alumni' : 'students'}` 
      });
    }

    // Attach users to request for use in route handlers
    req.currentUser = currentUser;
    req.otherUser = otherUser;
    next();
  } catch (err) {
    console.error('Chat access validation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = validateChatAccess;
