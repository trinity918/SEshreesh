const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  expertise: {
    type: [String],
    default: [],
  },
  availability: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'admin'],
    required: true,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Add a virtual `name` mapped to `username` so frontend can use .name
userSchema.virtual('name').get(function() {
  return this.username;
});

const User = mongoose.model('User', userSchema);

module.exports = User;