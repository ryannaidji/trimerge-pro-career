import { Document, Types } from 'mongoose';

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
import type { JobDepartment } from './departments';
export type { JobDepartment };

export interface Job {
  employerId: Types.ObjectId;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  employmentType: EmploymentType;
  department: JobDepartment;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  skills: string[];
  status: JobStatus;
}

export interface JobDocument extends Job, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}