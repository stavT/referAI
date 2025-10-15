import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile {
  // Basic Demographics
  age?: number;
  gender?: string;
  ethnicity?: string;
  race?: string;
  nationality?: string;
  currentLocation?: string;

  // Personal Background
  childhoodLocation?: string;
  familyStructure?: string;
  keyLifeEvents?: string[];
  
  // Education
  educationHistory?: Array<{
    school: string;
    degree: string;
    major: string;
    graduationYear?: number;
  }>;

  // Work Experience
  workExperience?: Array<{
    company: string;
    position: string;
    duration: string;
    skills: string[];
    achievements: string[];
  }>;

  // Personal Life
  romanticStatus?: string;
  hobbies?: string[];
  interests?: string[];
  personalityTraits?: {
    introvertExtrovert?: string;
    values?: string[];
    goals?: string[];
    strengths?: string[];
    weaknesses?: string[];
  };

  // Other Details
  languages?: string[];
  travelExperiences?: string[];
  volunteerWork?: string[];
  uniqueAspects?: {
    awards?: string[];
    publications?: string[];
    sideProjects?: string[];
  };

  // LinkedIn
  linkedinUrl?: string;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  provider?: string;
  profile?: IUserProfile;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false,
  },
  name: String,
  image: String,
  provider: {
    type: String,
    default: 'credentials',
  },
  profile: {
    age: Number,
    gender: String,
    ethnicity: String,
    race: String,
    nationality: String,
    currentLocation: String,
    childhoodLocation: String,
    familyStructure: String,
    keyLifeEvents: [String],
    educationHistory: [{
      school: String,
      degree: String,
      major: String,
      graduationYear: Number,
    }],
    workExperience: [{
      company: String,
      position: String,
      duration: String,
      skills: [String],
      achievements: [String],
    }],
    romanticStatus: String,
    hobbies: [String],
    interests: [String],
    personalityTraits: {
      introvertExtrovert: String,
      values: [String],
      goals: [String],
      strengths: [String],
      weaknesses: [String],
    },
    languages: [String],
    travelExperiences: [String],
    volunteerWork: [String],
    uniqueAspects: {
      awards: [String],
      publications: [String],
      sideProjects: [String],
    },
    linkedinUrl: String,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

