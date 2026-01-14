require("dotenv").config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const expRoutes = require('./routes/experiences');
const msgRoutes = require('./routes/messages');
const conversationRoutes = require('./routes/conversations');
const userRoutes = require('./routes/users');
const debugRoutes = require('./routes/debug');

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev')); // Log all API requests

// Rate limiting to prevent API spam
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for user endpoint (being spammed)
const userLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Increased to 200 while frontend implements caching
  message: { message: 'Too many user requests, please implement caching on frontend.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/users/:userId', userLimiter);

// Connect DB
connectDB(process.env.MONGO_URI);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/experiences', expRoutes);
app.use('/api/messages', msgRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/debug', debugRoutes);

// Basic index route
app.get('/', (req, res) => res.send('CampusConnect API running'));

// Health check endpoint
app.get('/health', (req, res) => {
  const onlineUsers = app.get('onlineUsers');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size,
    uptime: process.uptime()
  });
});

// Socket.io
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' }
});

const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Make onlineUsers and io accessible to routes
app.set('onlineUsers', onlineUsers);
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('user-online', (userId) => {
    // Remove any existing socket for this user (in case of reconnection)
    const existingSocketId = onlineUsers.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      userSockets.delete(existingSocketId);
    }
    
    onlineUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);
    
    // Broadcast updated online users list
    io.emit('online-users', Array.from(onlineUsers.keys()));
    
    // Also emit to the user who just came online
    socket.emit('you-are-online', { userId, onlineUsers: Array.from(onlineUsers.keys()) });
    
    console.log(`User ${userId} is online. Total online: ${onlineUsers.size}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const User = require('./models/User');
      const Message = require('./models/Message');

      // Validate required fields
      if (!data.sender || !data.receiver || !data.conversationId) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Validate message text
      if (!data.text || data.text.trim().length === 0) {
        socket.emit('error', { message: 'Message text is required' });
        return;
      }

      if (data.text.length > 5000) {
        socket.emit('error', { message: 'Message too long (max 5000 characters)' });
        return;
      }

      // PREVENT SELF-MESSAGING
      if (data.sender === data.receiver) {
        socket.emit('error', { message: 'You cannot message yourself' });
        return;
      }

      // Validate users exist
      const [sender, receiver] = await Promise.all([
        User.findById(data.sender).lean(),
        User.findById(data.receiver).lean()
      ]);

      if (!sender || !receiver) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // VALIDATE ROLES ARE DIFFERENT
      if (sender.role === receiver.role) {
        socket.emit('error', { 
          message: `You can only chat with ${sender.role === 'student' ? 'alumni' : 'students'}` 
        });
        return;
      }

      // Check if message already has an ID (already saved via API)
      let messageData;
      
      if (data._id) {
        // Message already saved via API, just use it for real-time delivery
        console.log('Message already saved via API, forwarding:', data._id);
        messageData = {
          _id: data._id,
          conversationId: data.conversationId,
          sender: data.sender,
          receiver: data.receiver,
          text: data.text,
          read: data.read || false,
          createdAt: data.createdAt
        };
      } else {
        // Legacy: Save message to database (for backward compatibility)
        console.log('Saving message via socket (legacy)');
        const message = await Message.create({
          conversationId: data.conversationId,
          sender: data.sender,
          receiver: data.receiver,
          text: data.text.trim(),
          read: false,
          createdAt: new Date()
        });

        messageData = {
          _id: message._id,
          conversationId: message.conversationId,
          sender: message.sender,
          receiver: message.receiver,
          text: message.text,
          read: message.read,
          createdAt: message.createdAt
        };
      }

      // Emit to receiver if online
      const receiverSocketId = onlineUsers.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive-message', messageData);
        console.log(`Message delivered to ${data.receiver} (online)`);
      } else {
        console.log(`Message saved for ${data.receiver} (offline)`);
      }

      // Emit confirmation back to sender with full message data
      socket.emit('message-sent', {
        success: true,
        message: messageData
      });

      console.log(`Message sent from ${data.sender} to ${data.receiver}`);
    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { 
        message: 'Failed to send message',
        details: err.message 
      });
    }
  });

  socket.on('typing', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        conversationId: data.conversationId,
        userId: data.userId
      });
    }
  });

  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
      
      // Broadcast updated online users list immediately
      io.emit('online-users', Array.from(onlineUsers.keys()));
      
      // Also emit specific user-offline event
      io.emit('user-offline', userId);
      
      console.log(`User ${userId} went offline. Total online: ${onlineUsers.size}`);
    }
    console.log('Socket disconnected:', socket.id);
  });

  // Handle explicit logout
  socket.on('user-offline', (userId) => {
    if (userSockets.get(socket.id) === userId) {
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
      io.emit('online-users', Array.from(onlineUsers.keys()));
      io.emit('user-offline', userId);
      console.log(`User ${userId} logged out`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

