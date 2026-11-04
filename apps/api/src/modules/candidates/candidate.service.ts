import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { CandidateProfileModel } from './candidate.model';
import { ApplicationModel } from '../applications/application.model';
import { CreateCandidateProfileInput, UpdateCandidateProfileInput } from './candidate.schemas';

export const candidateService = {
  async create(userId: string, input: CreateCandidateProfileInput) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'TALENT') {
      throw new AppError('Forbidden', 403);
    }

    const existingProfile = await CandidateProfileModel.findOne({ userId });
    if (existingProfile) {
      throw new AppError('Candidate profile already exists', 409);
    }

    const profile = await CandidateProfileModel.create({
      userId,
      ...input,
    });

    return { profile };
  },

  async getMe(userId: string) {
    const profile = await CandidateProfileModel.findOne({ userId });

    if (!profile) {
      throw new AppError('Candidate profile not found', 404);
    }

    return { profile };
  },

  async updateMe(userId: string, input: UpdateCandidateProfileInput) {
    const profile = await CandidateProfileModel.findOneAndUpdate(
      { userId },
      { $set: input },
      // Create the profile if the candidate skipped onboarding, so "My profile" always works (#50)
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return { profile };
  },

  async getById(id: string) {
    const profile = await CandidateProfileModel.findById(id);

    if (!profile) {
      throw new AppError('Candidate profile not found', 404);
    }

    const user = await UserModel.findById(profile.userId).select(
      '_id email accountType isVerified status profile createdAt updatedAt'
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [
      totalApplications,
      pendingApplications,
      reviewedApplications,
      shortlistedApplications,
      rejectedApplications,
      hiredApplications,
      recentApplications,
    ] = await Promise.all([
      ApplicationModel.countDocuments({ candidateId: user._id }),
      ApplicationModel.countDocuments({ candidateId: user._id, status: 'PENDING' }),
      ApplicationModel.countDocuments({ candidateId: user._id, status: 'REVIEWED' }),
      ApplicationModel.countDocuments({ candidateId: user._id, status: 'SHORTLISTED' }),
      ApplicationModel.countDocuments({ candidateId: user._id, status: 'REJECTED' }),
      ApplicationModel.countDocuments({ candidateId: user._id, status: 'HIRED' }),
      ApplicationModel.find({ candidateId: user._id })
        .populate('jobId', 'title location employmentType status')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      candidate: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        isVerified: user.isVerified,
        status: user.status,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      candidateProfile: profile,
      applicationSummary: {
        totalApplications,
        pendingApplications,
        reviewedApplications,
        shortlistedApplications,
        rejectedApplications,
        hiredApplications,
      },
      recentApplications,
    };
  },
};