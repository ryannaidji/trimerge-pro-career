import { ALL_DEPARTMENTS } from './departments';
import { z } from 'zod';

const departmentEnum = z.enum(ALL_DEPARTMENTS);

export const createJobSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  requirements: z.string().trim().optional(),
  location: z.string().trim().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  department: departmentEnum,
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  currency: z.string().trim().optional(),
  skills: z.array(z.string().trim()).default([]),
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT']).optional(),
});

export const updateJobSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  requirements: z.string().trim().optional(),
  location: z.string().trim().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  department: departmentEnum.optional(),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  currency: z.string().trim().optional(),
  skills: z.array(z.string().trim()).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT']).optional(),
});

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['OPEN', 'CLOSED', 'DRAFT']).optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']).optional(),
  department: departmentEnum.optional(),
  location: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;