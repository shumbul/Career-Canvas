const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  careerStage: {
    type: String,
    enum: ['early', 'mid', 'senior', 'leadership'],
    required: true
  },
  tags: [String],
  relatedSkills: [String],
  mediaUrls: [String],
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: String,
    displayName: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  visibility: {
    type: String,
    enum: ['public', 'organization', 'private'],
    default: 'organization'
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

// Create index for searching
StorySchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text',
  relatedSkills: 'text'
});

module.exports = mongoose.model('Story', StorySchema);
