import { escapeRegex } from '../../utils/escape-regex';
import { AppError } from '../../utils/app-error';
import { JobModel } from './job.model';
import { EmployerProfileModel } from '../employers/employer.model';

/** Add the employer's public company name and logo to each job (#53). */
async function withCompany(jobs: any[]) {
  const ids = [...new Set(jobs.map((j) => String(j.employerId)))];
  const profiles = await EmployerProfileModel.find({ userId: { $in: ids } }).select('userId companyName logoUrl').lean();
  const byUser = new Map(profiles.map((p: any) => [String(p.userId), p]));
  return jobs.map((j) => {
    const plain = typeof j.toJSON === 'function' ? j.toJSON() : j;
    const company = byUser.get(String(j.employerId)) as { companyName?: string; logoUrl?: string } | undefined;
    return { ...plain, company: company ? { name: company.companyName, logoUrl: company.logoUrl } : null };
  });
}
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
      jobs: await withCompany(jobs),
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

    return { job: (await withCompany([job]))[0] };
  },
};