import { Document, Types } from 'mongoose';

export type ResumeParsingStatus = 'NOT_UPLOADED' | 'PENDING' | 'SUCCESS' | 'FAILED';

export interface CandidateProfile {
  userId: Types.ObjectId;

  headline?: string;
  skills: string[];
  experienceLevel?: string;
  location?: string;
  bio?: string;

  resumeUrl?: string;
  resumePublicId?: string;
  resumeOriginalName?: string;
  resumeMimeType?: string;
  resumeSize?: number;
  resumeExtension?: string;
  resumeText?: string;
  resumeTextExtractedAt?: Date;
  resumeParsingStatus?: ResumeParsingStatus;
  resumeParsingError?: string;
  resumeUploadedAt?: Date;

  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  phoneNumber?: string;
  jobTitleOrDesiredRole?: string;
  yearsOfExperience?: string;
  professionalSummary?: string;
  searchable?: boolean;
}

export interface CandidateProfileDocument extends CandidateProfile, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}