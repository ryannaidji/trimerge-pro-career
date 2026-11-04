import { z } from 'zod';

export const createCandidateProfileSchema = z.object({
  headline: z.string().trim().optional(),
  skills: z.array(z.string().trim()).default([]),
  experienceLevel: z.string().trim().optional(),
  location: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  resumeUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  phoneNumber: z.string().trim().optional(),
  jobTitleOrDesiredRole: z.string().trim().optional(),
  yearsOfExperience: z.string().trim().optional(),
  professionalSummary: z.string().trim().optional(),
});

export const updateCandidateProfileSchema = z.object({
  headline: z.string().trim().optional(),
  skills: z.array(z.string().trim()).optional(),
  experienceLevel: z.string().trim().optional(),
  location: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  resumeUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  phoneNumber: z.string().trim().optional(),
  jobTitleOrDesiredRole: z.string().trim().optional(),
  yearsOfExperience: z.string().trim().optional(),
  professionalSummary: z.string().trim().optional(),
  searchable: z.boolean().optional(),
});

export type CreateCandidateProfileInput = z.infer<typeof createCandidateProfileSchema>;
export type UpdateCandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>;