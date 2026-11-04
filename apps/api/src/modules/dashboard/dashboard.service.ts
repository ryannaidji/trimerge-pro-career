import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { ApplicationModel } from '../applications/application.model';
import { JobModel } from '../jobs/job.model';
import { BookmarkModel } from '../bookmarks/bookmark.model';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { EmployerApplicantsQueryInput } from './dashboard.schemas';
import { formatApplication, formatJob } from '../../utils/response-formatters';

function normalizeText(value?: string): string {
  return (value || '').trim().toLowerCase();
}

function tokenize(value?: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function uniqueNormalizedSkills(skills: string[] = []): string[] {
  return [...new Set(skills.map((skill) => normalizeText(skill)).filter(Boolean))];
}

export function getTitleMatchScore(jobTitle?: string, candidateTitle?: string): number {
  const jobTokens = tokenize(jobTitle);
  const candidateTokens = tokenize(candidateTitle);

  if (jobTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  const overlap = jobTokens.filter((token) => candidateTokens.includes(token)).length;
  return Math.min(20, overlap * 10);
}

export function getTextMatchScore(jobText: string, candidateText: string): number {
  const jobTokens = tokenize(jobText);
  const candidateTokens = tokenize(candidateText);

  if (jobTokens.length === 0 || candidateTokens.length === 0) {
    return 0;
  }

  const overlap = jobTokens.filter((token) => candidateTokens.includes(token)).length;
  return Math.min(20, overlap * 2);
}

export function calculateSkillScore(jobSkills: string[], candidateSkills: string[]) {
  const normalizedJobSkills = uniqueNormalizedSkills(jobSkills);
  const normalizedCandidateSkills = uniqueNormalizedSkills(candidateSkills);

  if (normalizedJobSkills.length === 0) {
    return {
      skillScore: 0,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const matchedSkills = normalizedJobSkills.filter((skill) =>
    normalizedCandidateSkills.includes(skill)
  );
  const missingSkills = normalizedJobSkills.filter(
    (skill) => !normalizedCandidateSkills.includes(skill)
  );

  const skillRatio = matchedSkills.length / normalizedJobSkills.length;
  const skillScore = Math.round(skillRatio * 60);

  return {
    skillScore,
    matchedSkills,
    missingSkills,
  };
}

export const dashboardService = {
  async getCandidateSummary(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'TALENT') {
      throw new AppError('Forbidden', 403);
    }

    const [
      totalApplications,
      pendingApplications,
      reviewedApplications,
      shortlistedApplications,
      rejectedApplications,
      hiredApplications,
      totalBookmarks,
      recentApplications,
    ] = await Promise.all([
      ApplicationModel.countDocuments({ candidateId: userId }),
      ApplicationModel.countDocuments({ candidateId: userId, status: 'PENDING' }),
      ApplicationModel.countDocuments({ candidateId: userId, status: 'REVIEWED' }),
      ApplicationModel.countDocuments({ candidateId: userId, status: 'SHORTLISTED' }),
      ApplicationModel.countDocuments({ candidateId: userId, status: 'REJECTED' }),
      ApplicationModel.countDocuments({ candidateId: userId, status: 'HIRED' }),
      BookmarkModel.countDocuments({ candidateId: userId }),
      ApplicationModel.find({ candidateId: userId })
        .populate('jobId', 'title location employmentType status')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      summary: {
        totalApplications,
        pendingApplications,
        reviewedApplications,
        shortlistedApplications,
        rejectedApplications,
        hiredApplications,
        totalBookmarks,
      },
      recentApplications: recentApplications.map((application: any) => ({
        ...formatApplication(application),
        job: formatJob(application.jobId),
      })),
    };
  },

  async getEmployerSummary(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'EMPLOYER') {
      throw new AppError('Forbidden', 403);
    }

    const jobs = await JobModel.find({ employerId: userId }).select('_id status');
    const jobIds = jobs.map((job) => job._id);

    const totalJobs = jobs.length;
    const openJobs = jobs.filter((job) => job.status === 'OPEN').length;
    const closedJobs = jobs.filter((job) => job.status === 'CLOSED').length;
    const draftJobs = jobs.filter((job) => job.status === 'DRAFT').length;

    const [
      totalApplications,
      pendingApplications,
      reviewedApplications,
      shortlistedApplications,
      rejectedApplications,
      hiredApplications,
      recentApplications,
    ] = await Promise.all([
      jobIds.length ? ApplicationModel.countDocuments({ jobId: { $in: jobIds } }) : 0,
      jobIds.length ? ApplicationModel.countDocuments({ jobId: { $in: jobIds }, status: 'PENDING' }) : 0,
      jobIds.length ? ApplicationModel.countDocuments({ jobId: { $in: jobIds }, status: 'REVIEWED' }) : 0,
      jobIds.length ? ApplicationModel.countDocuments({ jobId: { $in: jobIds }, status: 'SHORTLISTED' }) : 0,
      jobIds.length ? ApplicationModel.countDocuments({ jobId: { $in: jobIds }, status: 'REJECTED' }) : 0,
      jobIds.length ? ApplicationModel.countDocuments({ jobId: { $in: jobIds }, status: 'HIRED' }) : 0,
      jobIds.length
        ? ApplicationModel.find({ jobId: { $in: jobIds } })
            .populate('jobId', 'title location employmentType status')
            .populate('candidateId', 'email profile')
            .sort({ createdAt: -1 })
            .limit(5)
        : [],
    ]);

    return {
      summary: {
        totalJobs,
        openJobs,
        closedJobs,
        draftJobs,
        totalApplications,
        pendingApplications,
        reviewedApplications,
        shortlistedApplications,
        rejectedApplications,
        hiredApplications,
      },
      recentApplications: recentApplications.map((application: any) => ({
        ...formatApplication(application),
        job: formatJob(application.jobId),
      })),
    };
  },

  async getEmployerRecentApplications(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'EMPLOYER') {
      throw new AppError('Forbidden', 403);
    }

    const jobs = await JobModel.find({ employerId: userId }).select('_id');
    const jobIds = jobs.map((job) => job._id);

    if (jobIds.length === 0) {
      return {
        recentApplications: [],
      };
    }

    const recentApplications = await ApplicationModel.find({
      jobId: { $in: jobIds },
    })
      .populate('jobId', 'title location employmentType status')
      .populate('candidateId', 'email profile')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      recentApplications: recentApplications.map((application: any) => ({
        ...formatApplication(application),
        job: formatJob(application.jobId),
      })),
    };
  },

  async getEmployerApplicants(userId: string, query: EmployerApplicantsQueryInput) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'EMPLOYER') {
      throw new AppError('Forbidden', 403);
    }

    const { status, jobId, page, limit } = query;
    const skip = (page - 1) * limit;

    const employerJobs = await JobModel.find({ employerId: userId }).select('_id');
    const employerJobIds = employerJobs.map((job) => job._id.toString());

    if (employerJobIds.length === 0) {
      return {
        applicants: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    if (jobId && !employerJobIds.includes(jobId)) {
      throw new AppError('Forbidden', 403);
    }

    const filter: any = {
      jobId: { $in: employerJobIds },
    };

    if (status) {
      filter.status = status;
    }

    if (jobId) {
      filter.jobId = jobId;
    }

    const [applications, total] = await Promise.all([
      ApplicationModel.find(filter)
        .populate('jobId', 'title location employmentType status')
        .populate('candidateId', 'email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ApplicationModel.countDocuments(filter),
    ]);

    const applicants = applications.map((application: any) => ({
      applicationId: application._id.toString(),
      status: application.status,
      coverLetter: application.coverLetter,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: formatJob(application.jobId),
      candidate: application.candidateId,
    }));

    return {
      applicants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getEmployerCandidateMatches(userId: string, jobId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'EMPLOYER') {
      throw new AppError('Forbidden', 403);
    }

    const job = await JobModel.findById(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employerId.toString() !== userId) {
      throw new AppError('Forbidden', 403);
    }

    const candidateProfiles = await CandidateProfileModel.find({})
      .populate('userId', '_id email profile accountType isVerified status')
      .sort({ updatedAt: -1 });

    const jobSkills = uniqueNormalizedSkills(job.skills || []);
    const jobText = [job.title, job.description, job.requirements, job.location].filter(Boolean).join(' ');

    const matches = candidateProfiles
      .map((profile: any) => {
        const userDoc = profile.userId;

        if (!userDoc || userDoc.accountType !== 'TALENT') {
          return null;
        }

        const candidateSkills = uniqueNormalizedSkills(profile.skills || []);
        const { skillScore, matchedSkills, missingSkills } = calculateSkillScore(jobSkills, candidateSkills);

        const titleScore = getTitleMatchScore(job.title, profile.jobTitleOrDesiredRole || profile.headline);
        const textScore = getTextMatchScore(
          jobText,
          [profile.professionalSummary, profile.bio, profile.jobTitleOrDesiredRole, profile.headline]
            .filter(Boolean)
            .join(' ')
        );

        const matchScore = Math.min(100, skillScore + titleScore + textScore);

        return {
          candidate: {
            id: userDoc._id,
            email: userDoc.email,
            profile: userDoc.profile,
            isVerified: userDoc.isVerified,
            status: userDoc.status,
          },
          candidateProfile: profile,
          matchScore,
          matchedSkills,
          missingSkills,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

    return {
      job: formatJob(job),
      totalMatches: matches.length,
      matches,
    };
  },
};