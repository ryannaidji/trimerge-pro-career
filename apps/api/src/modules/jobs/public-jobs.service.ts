import { escapeRegex } from '../../utils/escape-regex';
import { AppError } from '../../utils/app-error';
import { JobModel } from './job.model';
import { ListJobsQuery } from './job.schemas';

export const publicJobService = {
  async list(query: ListJobsQuery) {
    const { page, limit, employmentType, department, location, search } = query;

    const filter: any = {
      status: 'OPEN',
    };

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
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const job = await JobModel.findOne({ _id: id, status: 'OPEN' });

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    return { job };
  },
};