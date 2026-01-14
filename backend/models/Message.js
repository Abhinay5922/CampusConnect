const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
