const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MentorshipRequest = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
module.exports = MentorshipRequest;