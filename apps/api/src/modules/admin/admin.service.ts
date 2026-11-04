import { escapeRegex } from '../../utils/escape-regex';
import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { JobModel } from '../jobs/job.model';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { EmployerProfileModel } from '../employers/employer.model';
import { OtpCodeModel } from '../auth/otp-code.model';
import { RefreshTokenModel } from '../auth/refresh-token.model';
import { BookmarkModel } from '../bookmarks/bookmark.model';
import { ApplicationModel } from '../applications/application.model';
import {
  ListAdminJobsQuery,
  ListAdminUsersQuery,
  UpdateAdminJobStatusInput,
  UpdateAdminUserStatusInput,
} from './admin.schemas';

export const adminService = {
  async listUsers(query: ListAdminUsersQuery) {
    const { page, limit, accountType, status, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (accountType) filter.accountType = accountType;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: escapeRegex(search), $options: 'i' } },
        { 'profile.firstName': { $regex: escapeRegex(search), $options: 'i' } },
        { 'profile.lastName': { $regex: escapeRegex(search), $options: 'i' } },
        { 'profile.companyName': { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .select('_id email accountType isVerified status profile lastLoginAt createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateUserStatus(userId: string, input: UpdateAdminUserStatusInput) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.status = input.status;
    await user.save();

    // Suspending a user signs them out everywhere: revoke all refresh tokens
    if (input.status === 'SUSPENDED') {
      await RefreshTokenModel.updateMany(
        { userId: user._id, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    return {
      message: 'User status updated successfully.',
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        status: user.status,
      },
    };
  },

  async deleteUser(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType === 'ADMIN') {
      throw new AppError('Admin accounts cannot be deleted through this endpoint', 403);
    }

    if (user.accountType === 'TALENT') {
      await Promise.all([
        CandidateProfileModel.deleteOne({ userId }),
        BookmarkModel.deleteMany({ userId }),
        ApplicationModel.deleteMany({ candidateId: userId }),
      ]);
    }

    if (user.accountType === 'EMPLOYER') {
      const jobs = await JobModel.find({ employerId: userId }).select('_id');
      const jobIds = jobs.map((job) => job._id);

      await Promise.all([
        EmployerProfileModel.deleteOne({ userId }),
        BookmarkModel.deleteMany({ userId }),
        JobModel.deleteMany({ employerId: userId }),
        jobIds.length > 0
          ? ApplicationModel.deleteMany({ jobId: { $in: jobIds } })
          : Promise.resolve(),
      ]);
    }

    await Promise.all([
      OtpCodeModel.deleteMany({ userId }),
      RefreshTokenModel.deleteMany({ userId }),
      UserModel.findByIdAndDelete(userId),
    ]);

    return {
      message: 'User and related data deleted successfully.',
      deletedUser: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
    };
  },

  async listJobs(query: ListAdminJobsQuery) {
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
        { location: { $regex: escapeRegex(search), $options: 'i' } },
      ];
    }

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

  async updateJobStatus(jobId: string, input: UpdateAdminJobStatusInput) {
    const job = await JobModel.findById(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    job.status = input.status;
    await job.save();

    return {
      message: 'Job status updated successfully.',
      job,
    };
  },
};