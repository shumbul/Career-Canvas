const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  creatorId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  requiredSkills: [String],
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'weeks'
    }
  },
  estimatedHours: Number,
  startDate: Date,
  endDate: Date,
  maxParticipants: Number,
  participants: [{
    userId: String,
    displayName: String,
    role: String,
    joinDate: Date,
    managerApproval: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      managerId: String,
      notes: String,
      date: Date
    }
  }],
  department: String,
  outcomes: [String],
  learningObjectives: [String],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

// Create index for searching
ProjectSchema.index({ 
  title: 'text', 
  description: 'text', 
  requiredSkills: 'text',
  department: 'text'
});

module.exports = mongoose.model('Project', ProjectSchema);
