import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  currentRole?: string;
  currentCompany?: string;
  yearsOfExperience: number;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  industryPreferences: string[];
  locationPreferences: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: number;
  }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    achievements: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expirationDate?: Date;
    credentialId?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CareerProfileSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentRole: {
    type: String,
    trim: true
  },
  currentCompany: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0
  },
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  careerGoals: [{
    type: String,
    trim: true
  }],
  industryPreferences: [{
    type: String,
    trim: true
  }],
  locationPreferences: [{
    type: String,
    trim: true
  }],
  salaryRange: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  education: [{
    institution: {
      type: String,
      required: true,
      trim: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      required: true,
      trim: true
    },
    graduationYear: {
      type: Number,
      required: true
    }
  }],
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    description: {
      type: String,
      trim: true
    },
    achievements: [{
      type: String,
      trim: true
    }]
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expirationDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Indexes
CareerProfileSchema.index({ userId: 1 });
CareerProfileSchema.index({ skills: 1 });
CareerProfileSchema.index({ industryPreferences: 1 });

export default mongoose.model<ICareerProfile>('CareerProfile', CareerProfileSchema);