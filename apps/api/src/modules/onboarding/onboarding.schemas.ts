import { z } from 'zod';

export const onboardingRegisterSchema = z
  .object({
    fullName: z.string().trim().min(2),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(12),
    confirmPassword: z.string().min(12),
    role: z.enum(['Candidate', 'Recruiter']),
    agreeToTerms: z.boolean(),
    receiveUpdates: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.agreeToTerms === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy',
    path: ['agreeToTerms'],
  });

export const onboardingVerifyEmailSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  otp: z.string().min(4).max(10),
});

export const onboardingResendVerificationSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export const candidateStep2Schema = z.object({
  phoneNumber: z.string().trim().optional(),
  location: z.string().trim().min(1),
  jobTitleOrDesiredRole: z.string().trim().min(1),
  yearsOfExperience: z.string().trim().min(1),
  // The form sends an empty value when this optional field is left blank
  linkedinUrl: z.literal('').transform(() => undefined).or(z.string().url()).optional(),
  resumeUrl: z.string().trim().optional(),
});

export const candidateStep3Schema = z.object({
  skills: z.array(z.string().trim()).default([]),
  professionalSummary: z.string().trim().min(1).max(800),
});

export const recruiterStep2Schema = z.object({
  companyName: z.string().trim().min(1),
  phoneNumber: z.string().trim().optional(),
  companyWebsite: z.string().url().optional(),
  industry: z.string().trim().min(1),
  companySize: z.string().trim().optional(),
  location: z.string().trim().min(1),
  yourRole: z.string().trim().min(1),
  jobTitle: z.string().trim().optional(),
});

export const recruiterStep3Schema = z.object({
  companyOverview: z.string().trim().min(1).max(800),
  benefitsAndOpportunities: z.string().trim().min(1).max(800),
  primaryHiringNeeds: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return value;
    }, z.array(z.string().trim().min(1)).min(1)),
});

export type OnboardingRegisterInput = z.infer<typeof onboardingRegisterSchema>;
export type OnboardingVerifyEmailInput = z.infer<typeof onboardingVerifyEmailSchema>;
export type OnboardingResendVerificationInput = z.infer<typeof onboardingResendVerificationSchema>;
export type CandidateStep2Input = z.infer<typeof candidateStep2Schema>;
export type CandidateStep3Input = z.infer<typeof candidateStep3Schema>;
export type RecruiterStep2Input = z.infer<typeof recruiterStep2Schema>;
export type RecruiterStep3Input = z.infer<typeof recruiterStep3Schema>;