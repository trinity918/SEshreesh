const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  url: { type: String, required: true, trim: true },
  topics: { type: [String], default: [] },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'flagged'], default: 'active' },
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;