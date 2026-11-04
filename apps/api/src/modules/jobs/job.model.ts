import { ALL_DEPARTMENTS } from './departments';
import { Schema, model } from 'mongoose';
import { JobDocument } from './job.types';

const jobSchema = new Schema<JobDocument>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: String, trim: true },
    location: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'],
      required: true,
    },
    department: {
      type: String,
      enum: [...ALL_DEPARTMENTS],
      required: true,
      index: true,
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, trim: true, default: 'USD' },
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'DRAFT'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

jobSchema.index({ employerId: 1, createdAt: -1 });
jobSchema.index({ status: 1, employmentType: 1, department: 1, createdAt: -1 });

export const JobModel = model<JobDocument>('Job', jobSchema);