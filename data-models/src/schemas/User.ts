import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  microsoftId?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    dataSharing: boolean;
  };
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  microsoftId: {
    type: String,
    unique: true,
    sparse: true
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    },
    dataSharing: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ microsoftId: 1 });

export default mongoose.model<IUser>('User', UserSchema);