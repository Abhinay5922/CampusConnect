const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  role: { type: String },
  description: { type: String },
  interviewQuestions: [String],
  tips: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Experience', experienceSchema);
