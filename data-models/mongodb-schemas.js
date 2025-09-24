# MongoDB Data Models for Career Canvas

## Collection Schemas

### 1. stories
```javascript
{
  _id: ObjectId,
  userId: String, // Azure AD user identifier
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: true,
    maxLength: 5000
  },
  category: {
    type: String,
    required: true,
    enum: ['leadership', 'technical', 'career-change', 'mentorship', 'teamwork', 'problem-solving']
  },
  tags: [{
    type: String,
    maxLength: 50
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  mediaUrls: [String],
  careerLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive']
  },
  industry: String,
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: String,
    content: {
      type: String,
      maxLength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### 2. mentorship_preferences
```javascript
{
  _id: ObjectId,
  userId: {
    type: String,
    required: true,
    unique: true
  },
  mentorshipType: {
    type: String,
    required: true,
    enum: ['seeking-mentor', 'offering-mentor', 'both']
  },
  preferences: {
    industries: [{
      type: String,
      enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'operations', 'consulting', 'retail', 'manufacturing', 'other']
    }],
    skills: [String],
    careerLevels: [{
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive']
    }],
    meetingFrequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed']
    },
    communicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'structured']
    },
    goals: [String],
    timeCommitment: {
      type: String,
      enum: ['1-2-hours', '3-5-hours', '6-plus-hours']
    },
    remotePreference: {
      type: String,
      enum: ['remote-only', 'in-person', 'hybrid']
    }
  },
  availability: {
    timezone: String,
    preferredTimes: [{
      type: String,
      enum: [
        'monday-morning', 'monday-afternoon', 'monday-evening',
        'tuesday-morning', 'tuesday-afternoon', 'tuesday-evening',
        'wednesday-morning', 'wednesday-afternoon', 'wednesday-evening',
        'thursday-morning', 'thursday-afternoon', 'thursday-evening',
        'friday-morning', 'friday-afternoon', 'friday-evening',
        'saturday-morning', 'saturday-afternoon', 'saturday-evening',
        'sunday-morning', 'sunday-afternoon', 'sunday-evening'
      ]
    }],
    startDate: Date,
    endDate: Date
  },
  bio: {
    type: String,
    maxLength: 1000
  },
  experience: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### 3. users
```javascript
{
  _id: ObjectId,
  azureId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  jobTitle: String,
  company: String,
  department: String,
  location: String,
  profilePicture: String,
  careerLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive']
  },
  industry: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'operations', 'consulting', 'retail', 'manufacturing', 'other']
  },
  skills: [String],
  interests: [String],
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

### 4. mentorship_connections
```javascript
{
  _id: ObjectId,
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
    enum: ['pending', 'accepted', 'declined', 'completed', 'paused'],
    default: 'pending'
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  goals: [String],
  notes: String,
  meetings: [{
    scheduledDate: Date,
    duration: Number, // minutes
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    completedAt: Date
  }],
  feedback: [{
    fromUserId: String,
    toUserId: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### 5. career_goals
```javascript
{
  _id: ObjectId,
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  description: {
    type: String,
    maxLength: 1000
  },
  category: {
    type: String,
    enum: ['skill-development', 'networking', 'career-advancement', 'leadership', 'certification', 'project-completion']
  },
  targetDate: Date,
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused', 'cancelled'],
    default: 'not-started'
  },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  mentorId: String, // Optional - if working with a mentor on this goal
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### 6. activities
```javascript
{
  _id: ObjectId,
  userId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'story-shared', 
      'mentor-connected', 
      'goal-created', 
      'goal-completed', 
      'meeting-completed',
      'profile-updated',
      'comment-added',
      'story-liked'
    ]
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  points: {
    type: Number,
    default: 0
  },
  relatedId: String, // ID of related story, goal, etc.
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## Indexes for Performance

```javascript
// stories collection
db.stories.createIndex({ userId: 1, createdAt: -1 })
db.stories.createIndex({ category: 1, isPublic: 1 })
db.stories.createIndex({ tags: 1 })
db.stories.createIndex({ createdAt: -1 })

// mentorship_preferences collection
db.mentorship_preferences.createIndex({ userId: 1 }, { unique: true })
db.mentorship_preferences.createIndex({ "preferences.industries": 1 })
db.mentorship_preferences.createIndex({ "preferences.skills": 1 })
db.mentorship_preferences.createIndex({ mentorshipType: 1, isActive: 1 })

// users collection
db.users.createIndex({ azureId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ industry: 1, careerLevel: 1 })
db.users.createIndex({ skills: 1 })

// mentorship_connections collection
db.mentorship_connections.createIndex({ mentorId: 1, menteeId: 1 })
db.mentorship_connections.createIndex({ status: 1, createdAt: -1 })

// career_goals collection
db.career_goals.createIndex({ userId: 1, status: 1 })
db.career_goals.createIndex({ targetDate: 1, status: 1 })

// activities collection
db.activities.createIndex({ userId: 1, createdAt: -1 })
db.activities.createIndex({ type: 1, createdAt: -1 })
```

## Sample Data for Testing

```javascript
// Sample story
{
  "userId": "user123@microsoft.com",
  "title": "Leading My First Cross-Functional Project",
  "content": "When I was asked to lead a project involving engineering, design, and marketing teams, I initially felt overwhelmed...",
  "category": "leadership",
  "tags": ["leadership", "project-management", "teamwork"],
  "isPublic": true,
  "careerLevel": "mid",
  "industry": "technology",
  "likes": 15,
  "views": 142
}

// Sample mentorship preferences
{
  "userId": "user123@microsoft.com",
  "mentorshipType": "seeking-mentor",
  "preferences": {
    "industries": ["technology", "finance"],
    "skills": ["leadership", "public-speaking", "strategic-planning"],
    "careerLevels": ["senior", "executive"],
    "meetingFrequency": "bi-weekly",
    "communicationStyle": "structured",
    "goals": ["Prepare for senior leadership role", "Improve presentation skills"],
    "timeCommitment": "3-5-hours",
    "remotePreference": "hybrid"
  },
  "availability": {
    "timezone": "PST",
    "preferredTimes": ["tuesday-evening", "thursday-evening", "saturday-morning"]
  },
  "bio": "Mid-level program manager looking to transition to senior leadership",
  "experience": "5 years"
}
```