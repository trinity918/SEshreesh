const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      role: { type: String, enum: ['student', 'alumni', 'admin'], required: true },
      avatar: { type: String },
    }
  ],
  lastMessage: { type: String, trim: true },
  unreadCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;