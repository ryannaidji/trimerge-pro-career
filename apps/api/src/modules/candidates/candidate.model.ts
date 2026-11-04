import { Schema, model } from 'mongoose';
import { CandidateProfileDocument } from './candidate.types';

const candidateProfileSchema = new Schema<CandidateProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    headline: { type: String, trim: true },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, trim: true },

    resumeUrl: { type: String, trim: true },

    resumePublicId: { type: String, trim: true },
    resumeOriginalName: { type: String, trim: true },
    resumeMimeType: { type: String, trim: true },
    resumeSize: { type: Number },
    resumeExtension: { type: String, trim: true },
    resumeText: { type: String },
    resumeTextExtractedAt: { type: Date },
    resumeParsingStatus: {
      type: String,
      enum: ['NOT_UPLOADED', 'PENDING', 'SUCCESS', 'FAILED'],
      default: 'NOT_UPLOADED',
    },
    resumeParsingError: { type: String, trim: true },
    resumeUploadedAt: { type: Date },

    portfolioUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    jobTitleOrDesiredRole: { type: String, trim: true },
    yearsOfExperience: { type: String, trim: true },
    professionalSummary: { type: String, trim: true },
    // Visible to employers in talent search (#60); candidates can opt out
    searchable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

candidateProfileSchema.index({ userId: 1 }, { unique: true });

export const CandidateProfileModel = model<CandidateProfileDocument>(
  'CandidateProfile',
  candidateProfileSchema
);