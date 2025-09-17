const mongoose = require('mongoose');

const MentorshipSchema = new mongoose.Schema({
  mentorId: {
    type: String,
    required: true
  },
  menteeId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'active', 'completed', 'declined'],
    default: 'requested'
  },
  focusAreas: [String],
  goals: [String],
  startDate: Date,
  endDate: Date,
  meetingFrequency: String,
  notes: String,
  sessions: [{
    date: Date,
    duration: Number, // in minutes
    notes: String,
    completed: Boolean
  }],
  progress: [{
    date: Date,
    milestone: String,
    achieved: Boolean
  }],
  feedback: {
    mentorRating: Number,
    menteeRating: Number,
    mentorFeedback: String,
    menteeFeedback: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for mentor-mentee pairs
MentorshipSchema.index({ mentorId: 1, menteeId: 1 });

module.exports = mongoose.model('Mentorship', MentorshipSchema);
