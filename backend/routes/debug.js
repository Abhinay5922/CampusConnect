const express = require('express');
const router = express.Router();

// Debug endpoint to check online users
router.get('/online-users', (req, res) => {
  const onlineUsers = req.app.get('onlineUsers');
  const onlineArray = Array.from(onlineUsers.entries());
  
  res.json({
    count: onlineUsers.size,
    users: onlineArray.map(([userId, socketId]) => ({
      userId,
      socketId
    }))
  });
});

// Debug endpoint to check socket connections
router.get('/socket-info', (req, res) => {
  const io = req.app.get('io');
  const sockets = io.sockets.sockets;
  
  res.json({
    totalConnections: sockets.size,
    socketIds: Array.from(sockets.keys())
  });
});

module.exports = router;
