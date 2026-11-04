import { escapeRegex } from '../../utils/escape-regex';
import { AppError } from '../../utils/app-error';
import { formatJob } from '../../utils/response-formatters';
import { UserModel } from '../users/user.model';
import { JobModel } from './job.model';
import { CreateJobInput, UpdateJobInput, ListJobsQuery } from './job.schemas';

export const jobService = {
  async create(employerId: string, input: CreateJobInput) {
    const user = await UserModel.findById(employerId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'EMPLOYER') {
      throw new AppError('Forbidden', 403);
    }

    const job = await JobModel.create({
      employerId,
      ...input,
      status: input.status ?? 'OPEN',
    });

    return { job: formatJob(job) };
  },

  async list(query: ListJobsQuery) {
    const { page, limit, status, employmentType, department, location, search } = query;

    const filter: any = {};

    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (department) filter.department = department;
    if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
        { skills: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      JobModel.countDocuments(filter),
    ]);

    return {
      jobs: jobs.map((job) => formatJob(job)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const job = await JobModel.findById(id);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    return { job: formatJob(job) };
  },

  async update(employerId: string, jobId: string, input: UpdateJobInput) {
    const job = await JobModel.findById(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employerId.toString() !== employerId) {
      throw new AppError('Forbidden', 403);
    }

    Object.assign(job, input);
    await job.save();

    return { job: formatJob(job) };
  },

  async remove(employerId: string, jobId: string) {
    const job = await JobModel.findById(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employerId.toString() !== employerId) {
      throw new AppError('Forbidden', 403);
    }

    await JobModel.findByIdAndDelete(jobId);

    return { message: 'Job deleted successfully.' };
  },

  async getMyJobs(employerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      JobModel.find({ employerId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      JobModel.countDocuments({ employerId }),
    ]);

    return {
      jobs: jobs.map((job) => formatJob(job)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getEmployerStats(employerId: string) {
    const [totalJobs, openJobs, closedJobs, draftJobs] = await Promise.all([
      JobModel.countDocuments({ employerId }),
      JobModel.countDocuments({ employerId, status: 'OPEN' }),
      JobModel.countDocuments({ employerId, status: 'CLOSED' }),
      JobModel.countDocuments({ employerId, status: 'DRAFT' }),
    ]);

    return {
      stats: {
        totalJobs,
        openJobs,
        closedJobs,
        draftJobs,
      },
    };
  },
};