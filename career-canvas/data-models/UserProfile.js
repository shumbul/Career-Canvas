const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: String,
  jobTitle: String,
  location: String,
  skills: [String],
  yearsOfExperience: Number,
  bio: String,
  profilePictureUrl: String,
  careerJourney: [{
    role: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String,
    skills: [String],
    achievements: [String]
  }],
  mentorshipPreferences: {
    isAvailableAsMentor: Boolean,
    mentorshipAreas: [String],
    mentorshipCapacity: Number,
    preferredMeetingFrequency: String
  },
  mentorshipGoals: [String],
  careerGoals: [String],
  interests: [String],
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
UserProfileSchema.index({ 
  displayName: 'text', 
  jobTitle: 'text', 
  skills: 'text',
  department: 'text',
  'mentorshipPreferences.mentorshipAreas': 'text'
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
