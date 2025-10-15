import mongoose, { Schema, Document } from 'mongoose';

export interface IReferralMatch {
  name: string;
  linkedinUrl: string;
  relevance: string;
  commonalities: string[];
  suggestedMessage: string;
  connectionDegree?: string;
}

export interface IJobSearch extends Document {
  userId: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  jobDescription: string;
  jobUrl?: string;
  referralMatches: IReferralMatch[];
  createdAt: Date;
}

const JobSearchSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  jobUrl: String,
  referralMatches: [{
    name: String,
    linkedinUrl: String,
    relevance: String,
    commonalities: [String],
    suggestedMessage: String,
    connectionDegree: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.models.JobSearch || mongoose.model<IJobSearch>('JobSearch', JobSearchSchema);

