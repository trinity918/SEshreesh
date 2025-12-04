const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  duration: { type: String, trim: true },
  skillsRequired: { type: [String], default: [] },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resumeFileName: { type: String },
      appliedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    }
  ],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
}, { timestamps: true });

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;