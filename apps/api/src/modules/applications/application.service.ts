import crypto from 'crypto';
import path from 'path';
import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { JobModel } from '../jobs/job.model';
import { ApplicationModel } from './application.model';
import { CreateApplicationInput, UpdateApplicationStatusInput } from './application.schemas';
import {
  sendApplicationStatusUpdatedEmail,
  sendNewApplicationNotificationEmail,
} from '../../lib/mailgun';
import { storeFile, StoredFile } from '../../lib/storage';
import { aiMatchService, isAiMatchingAvailable } from '../ai-matching/ai-match.service';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { AiMatchEvaluationModel } from '../ai-matching/ai-match.model';
import { extractResumeText } from '../resumes/resume-parser.service';
import { formatApplication, formatJob } from '../../utils/response-formatters';

type GetApplicationsForJobOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  recommendation?: string;
  confidenceLevel?: string;
  aiMatchStatus?: string;
  staleOnly?: boolean;
};

function createHash(value: unknown) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value ?? ''))
    .digest('hex');
}

function buildJobSnapshot(job: any) {
  return {
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    skills: job.skills || [],
    location: job.location,
    employmentType: job.employmentType,
    department: job.department,
  };
}

function getAiEvaluationFreshness(input: {
  aiEvaluation: any;
  job: any;
  profile: any;
  application: any;
}) {
  const currentJobContentHash = createHash(buildJobSnapshot(input.job));
  const currentResumeTextHash = createHash(input.profile?.resumeText);
  const currentCoverLetterHash = input.application?.coverLetter
    ? createHash(input.application.coverLetter)
    : undefined;

  const isJobCurrent = input.aiEvaluation?.jobContentHash === currentJobContentHash;
  const isResumeCurrent = input.aiEvaluation?.resumeTextHash === currentResumeTextHash;
  const isCoverLetterCurrent =
    (input.aiEvaluation?.coverLetterHash || undefined) === currentCoverLetterHash;

  const staleReasons: string[] = [];

  if (!isJobCurrent) staleReasons.push('JOB_CHANGED');
  if (!isResumeCurrent) staleReasons.push('RESUME_CHANGED');
  if (!isCoverLetterCurrent) staleReasons.push('COVER_LETTER_CHANGED');

  return {
    isCurrent: staleReasons.length === 0,
    staleReasons,
  };
}

function sanitizeOriginalName(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '');
}

function buildFinalCoverLetterText(input: {
  plainText?: string;
  extractedText?: string;
}) {
  const plainText = input.plainText?.trim();
  const extractedText = input.extractedText?.trim();

  if (plainText && extractedText) {
    return `${plainText}\n\n--- Extracted from uploaded cover letter file ---\n\n${extractedText}`;
  }

  if (plainText) return plainText;
  if (extractedText) return extractedText;

  return undefined;
}

export const applicationService = {
  async create(
   candidateId: string | null,
  input: CreateApplicationInput,
  resumeFile?: Express.Multer.File,
  coverLetterFile?: Express.Multer.File
) {
  if (!candidateId) {
    throw new AppError('Authentication required', 401);
  }

  const user = await UserModel.findById(candidateId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.accountType !== 'TALENT') {
    throw new AppError('Forbidden', 403);
  }

  const job = await JobModel.findById(input.jobId);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  if (job.status !== 'OPEN') {
    throw new AppError('Job is not open for applications', 400);
  }

  const existing = await ApplicationModel.findOne({
    jobId: input.jobId,
    candidateId,
  });

  if (existing) {
    throw new AppError('You have already applied to this job', 409);
  }

  //
  // Resume
  //
  let resumeFileUrl: string | undefined;
  let resumePublicId: string | undefined;
  let resumeOriginalName: string | undefined;
  let resumeMimeType: string | undefined;
  let resumeSize: number | undefined;
  let resumeExtension: string | undefined;

  if (resumeFile) {
    resumeOriginalName = sanitizeOriginalName(resumeFile.originalname);
    resumeMimeType = resumeFile.mimetype;
    resumeSize = resumeFile.size;
    resumeExtension = path.extname(resumeFile.originalname).toLowerCase();

    try {
      const uploadedResume = await storeFile(resumeFile, 'resumes');

      resumeFileUrl = uploadedResume.secure_url;
      resumePublicId = uploadedResume.public_id;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to upload resume', 500);
    }
  }

  
  // Cover Letter
  //
  let coverLetterFileUrl: string | undefined;
  let coverLetterPublicId: string | undefined;
  let coverLetterOriginalName: string | undefined;
  let coverLetterMimeType: string | undefined;
  let coverLetterSize: number | undefined;
  let coverLetterExtension: string | undefined;
  let coverLetterExtractedText: string | undefined;
  let coverLetterTextExtractedAt: Date | undefined;
  let coverLetterParsingStatus: 'NOT_PROVIDED' | 'SUCCESS' | 'FAILED' =
    input.coverLetter ? 'SUCCESS' : 'NOT_PROVIDED';
  let coverLetterParsingError: string | undefined;

  if (coverLetterFile) {
    coverLetterOriginalName = sanitizeOriginalName(
      coverLetterFile.originalname
    );

    coverLetterMimeType = coverLetterFile.mimetype;
    coverLetterSize = coverLetterFile.size;
    coverLetterExtension = path
      .extname(coverLetterFile.originalname)
      .toLowerCase();

    try {
      const uploadedCoverLetter =
        await storeFile(coverLetterFile, 'cover-letters');

      coverLetterFileUrl = uploadedCoverLetter.secure_url;
      coverLetterPublicId = uploadedCoverLetter.public_id;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Failed to upload cover letter to cloud storage',
        500
      );
    }

    try {
      coverLetterExtractedText =
        await extractResumeText(coverLetterFile);

      coverLetterTextExtractedAt = new Date();
      coverLetterParsingStatus = 'SUCCESS';
    } catch (error) {
      coverLetterParsingStatus = input.coverLetter
        ? 'SUCCESS'
        : 'FAILED';

      coverLetterParsingError =
        error instanceof Error
          ? error.message
          : 'Cover letter text extraction failed';
    }
  }

  const finalCoverLetter = buildFinalCoverLetterText({
    plainText: input.coverLetter,
    extractedText: coverLetterExtractedText,
  });

  const application = await ApplicationModel.create({
    jobId: input.jobId,
    candidateId,
    coverLetter: finalCoverLetter,
    status: 'PENDING',

    // Resume
    resumeFileUrl,
    resumePublicId,
    resumeOriginalName,
    resumeMimeType,
    resumeSize,
    resumeExtension,

    // Cover letter
    coverLetterFileUrl,
    coverLetterPublicId,
    coverLetterOriginalName,
    coverLetterMimeType,
    coverLetterSize,
    coverLetterExtension,
    coverLetterTextExtractedAt,
    coverLetterParsingStatus,
    coverLetterParsingError,

    aiMatchStatus: 'NOT_STARTED',
  });

  let aiEvaluation = null;

  try {
    aiEvaluation = await aiMatchService.evaluateApplication(
      application._id.toString()
    );
  } catch (error) {
    console.error('Failed to evaluate application with AI:', error);
  }

  try {
    const employer = await UserModel.findById(job.employerId);

    if (employer?.email) {
      await sendNewApplicationNotificationEmail({
        to: employer.email,
        jobTitle: job.title,
      });
    }
  } catch (error) {
    console.error(
      'Failed to send new application notification email:',
      error
    );
  }

  return {
    application: {
      ...formatApplication(application),
      jobId: input.jobId,
      employerId: job.employerId.toString(),
      job: formatJob(job),
    },
    aiEvaluation,
  };
},

  async createold(
    candidateId: string,
    input: CreateApplicationInput,
    coverLetterFile?: Express.Multer.File
  ) {
    const user = await UserModel.findById(candidateId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'TALENT') {
      throw new AppError('Forbidden', 403);
    }

    const job = await JobModel.findById(input.jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.status !== 'OPEN') {
      throw new AppError('Job is not open for applications', 400);
    }

    const existing = await ApplicationModel.findOne({
      jobId: input.jobId,
      candidateId,
    });

    if (existing) {
      throw new AppError('You have already applied to this job', 409);
    }

    let coverLetterFileUrl: string | undefined;
    let coverLetterPublicId: string | undefined;
    let coverLetterOriginalName: string | undefined;
    let coverLetterMimeType: string | undefined;
    let coverLetterSize: number | undefined;
    let coverLetterExtension: string | undefined;
    let coverLetterExtractedText: string | undefined;
    let coverLetterTextExtractedAt: Date | undefined;
    let coverLetterParsingStatus: 'NOT_PROVIDED' | 'SUCCESS' | 'FAILED' = input.coverLetter
      ? 'SUCCESS'
      : 'NOT_PROVIDED';
    let coverLetterParsingError: string | undefined;

    if (coverLetterFile) {
      coverLetterOriginalName = sanitizeOriginalName(coverLetterFile.originalname);
      coverLetterMimeType = coverLetterFile.mimetype;
      coverLetterSize = coverLetterFile.size;
      coverLetterExtension = path.extname(coverLetterFile.originalname).toLowerCase();

      try {
        const uploadedCoverLetter = await storeFile(coverLetterFile, 'cover-letters');

        coverLetterFileUrl = uploadedCoverLetter.secure_url;
        coverLetterPublicId = uploadedCoverLetter.public_id;
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to upload cover letter to cloud storage', 500);
      }

      try {
        coverLetterExtractedText = await extractResumeText(coverLetterFile);
        coverLetterTextExtractedAt = new Date();
        coverLetterParsingStatus = 'SUCCESS';
      } catch (error) {
        coverLetterParsingStatus = input.coverLetter ? 'SUCCESS' : 'FAILED';

        if (error instanceof Error) {
          coverLetterParsingError = error.message;
        } else {
          coverLetterParsingError = 'Cover letter text extraction failed';
        }
      }
    }

    const finalCoverLetter = buildFinalCoverLetterText({
      plainText: input.coverLetter,
      extractedText: coverLetterExtractedText,
    });

    const application = await ApplicationModel.create({
      jobId: input.jobId,
      candidateId,
      coverLetter: finalCoverLetter,
      status: 'PENDING',

      coverLetterFileUrl,
      coverLetterPublicId,
      coverLetterOriginalName,
      coverLetterMimeType,
      coverLetterSize,
      coverLetterExtension,
      coverLetterTextExtractedAt,
      coverLetterParsingStatus,
      coverLetterParsingError,

      aiMatchStatus: 'NOT_STARTED',
    });

    let aiEvaluation = null;

    try {
      aiEvaluation = await aiMatchService.evaluateApplication(application._id.toString());
    } catch (error) {
      console.error('Failed to evaluate application with AI:', error);
    }

    try {
      const employer = await UserModel.findById(job.employerId);

      if (employer?.email) {
        await sendNewApplicationNotificationEmail({
          to: employer.email,
          jobTitle: job.title,
          //candidateEmail: user.email,
        });
      }
    } catch (error) {
      console.error('Failed to send new application notification email:', error);
    }

    return {
      application: {
        ...formatApplication(application),
        jobId: input.jobId,
        employerId: job.employerId.toString(),
        job: formatJob(job),
      },
      aiEvaluation,
    };
  },

  async getMyApplications(candidateId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      ApplicationModel.find({ candidateId })
        .populate('jobId', 'title description requirements location employmentType department status skills employerId createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ApplicationModel.countDocuments({ candidateId }),
    ]);

    const formattedApplications = applications.map((application: any) => {
      const formattedApplication = formatApplication(application);
      const job = formatJob(application.jobId);

      return {
        ...formattedApplication,
        job,
        employerId: job?.employerId ?? formattedApplication?.employerId,
      };
    });

    return {
      applications: formattedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getApplicationsForJob(
    employerId: string,
    jobId: string,
    options: GetApplicationsForJobOptions = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy ?? 'newest';

    const job = await JobModel.findById(jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employerId.toString() !== employerId) {
      throw new AppError('Forbidden', 403);
    }

    const skip = (page - 1) * limit;

    const applicationFilter: any = { jobId };

    if (options.aiMatchStatus) {
      applicationFilter.aiMatchStatus = options.aiMatchStatus;
    }

    if (options.recommendation) {
      applicationFilter.aiRecommendation = options.recommendation;
    }

    let sort: any = { createdAt: -1 };

    if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    }

    if (sortBy === 'aiScore') {
      sort = { aiOverallScore: -1, createdAt: -1 };
    }

    if (sortBy === 'aiScoreLow') {
      sort = { aiOverallScore: 1, createdAt: -1 };
    }

    const [applicationsRaw, totalRaw] = await Promise.all([
      ApplicationModel.find(applicationFilter)
        .populate('candidateId', 'email accountType profile.firstName profile.lastName')
        .sort(sort)
        .lean(),
      ApplicationModel.countDocuments(applicationFilter),
    ]);

    const candidateUserIds = applicationsRaw.map((application: any) => {
      const candidate = application.candidateId;
      return typeof candidate === 'object' ? candidate._id?.toString() : candidate?.toString();
    });

    const applicationIds = applicationsRaw.map((application: any) => application._id);

    const [candidateProfiles, aiEvaluations] = await Promise.all([
      CandidateProfileModel.find({
        userId: { $in: candidateUserIds },
      }).lean(),

      AiMatchEvaluationModel.find({
        applicationId: { $in: applicationIds },
      }).lean(),
    ]);

    const profileByUserId = new Map(
      candidateProfiles.map((profile: any) => [profile.userId.toString(), profile])
    );

    const evaluationByApplicationId = new Map(
      aiEvaluations.map((evaluation: any) => [evaluation.applicationId.toString(), evaluation])
    );

    let enrichedApplications = applicationsRaw.map((application: any) => {
      const candidate = application.candidateId;
      const candidateUserId =
        typeof candidate === 'object' ? candidate._id?.toString() : candidate?.toString();

      const profile = profileByUserId.get(candidateUserId);
      const aiEvaluation = evaluationByApplicationId.get(application._id.toString());

      const aiFreshness = aiEvaluation
        ? getAiEvaluationFreshness({
            aiEvaluation,
            job,
            profile,
            application,
          })
        : null;

      return {
        ...formatApplication(application),
        employerId: job.employerId.toString(),

        candidate: {
          user: candidate,
          profile: profile
            ? {
                headline: profile.headline,
                skills: profile.skills,
                experienceLevel: profile.experienceLevel,
                location: profile.location,
                bio: profile.bio,
                resumeUrl: profile.resumeUrl,
                portfolioUrl: profile.portfolioUrl,
                linkedinUrl: profile.linkedinUrl,
                githubUrl: profile.githubUrl,
                phoneNumber: profile.phoneNumber,
                jobTitleOrDesiredRole: profile.jobTitleOrDesiredRole,
                yearsOfExperience: profile.yearsOfExperience,
                professionalSummary: profile.professionalSummary,
                resumeParsingStatus: profile.resumeParsingStatus,
                resumeParsingError: profile.resumeParsingError,
                resumeUploadedAt: profile.resumeUploadedAt,
              }
            : null,
        },

        aiMatch: aiEvaluation
          ? {
              status: application.aiMatchStatus,
              overallScore: aiEvaluation.overallScore,
              recommendation: aiEvaluation.recommendation,

              confidenceScore: aiEvaluation.confidenceScore,
              confidenceLevel: aiEvaluation.confidenceLevel,
              confidenceReason: aiEvaluation.confidenceReason,

              scoreBreakdown: aiEvaluation.scoreBreakdown,

              matchedSkills: aiEvaluation.matchedSkills,
              missingSkills: aiEvaluation.missingSkills,

              requiredSkillsMatched: aiEvaluation.requiredSkillsMatched,
              requiredSkillsMissing: aiEvaluation.requiredSkillsMissing,
              preferredSkillsMatched: aiEvaluation.preferredSkillsMatched,
              preferredSkillsMissing: aiEvaluation.preferredSkillsMissing,

              strengths: aiEvaluation.strengths,
              concerns: aiEvaluation.concerns,

              evidence: aiEvaluation.evidence,

              recruiterSummary: aiEvaluation.recruiterSummary,
              detailedRecruiterAnalysis: aiEvaluation.detailedRecruiterAnalysis,

              evaluatedAt: aiEvaluation.createdAt,
              freshness: aiFreshness,
            }
          : {
              status: application.aiMatchStatus,
              overallScore: application.aiOverallScore,
              recommendation: application.aiRecommendation,
              message: application.aiError || 'AI evaluation not available yet.',
            },
      };
    });

    if (options.confidenceLevel) {
      enrichedApplications = enrichedApplications.filter(
        (application: any) => application.aiMatch?.confidenceLevel === options.confidenceLevel
      );
    }

    if (options.staleOnly) {
      enrichedApplications = enrichedApplications.filter(
        (application: any) => application.aiMatch?.freshness?.isCurrent === false
      );
    }

    const filteredTotal = enrichedApplications.length;

    const paginatedApplications = enrichedApplications.slice(skip, skip + limit);

    const formattedJob = formatJob(job);

    return {
      job: formattedJob,
      applications: paginatedApplications,
      emptyState:
        paginatedApplications.length === 0
          ? {
              title: 'No applicants yet',
              message: 'Applications for this job will appear here once candidates start applying.',
            }
          : undefined,
      filters: {
        sortBy,
        recommendation: options.recommendation,
        confidenceLevel: options.confidenceLevel,
        aiMatchStatus: options.aiMatchStatus,
        staleOnly: options.staleOnly ?? false,
      },
      pagination: {
        page,
        limit,
        total: options.confidenceLevel || options.staleOnly ? filteredTotal : totalRaw,
        totalPages: Math.ceil(
          (options.confidenceLevel || options.staleOnly ? filteredTotal : totalRaw) / limit
        ),
      },
    };
  },

  async retryAiMatch(employerId: string, applicationId: string) {
    const application = await ApplicationModel.findById(applicationId);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const job = await JobModel.findById(application.jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employerId.toString() !== employerId) {
      throw new AppError('Forbidden', 403);
    }

    await ApplicationModel.findByIdAndUpdate(applicationId, {
      $set: {
        aiMatchStatus: 'PENDING',
      },
      $unset: {
        aiError: '',
      },
    });

    if (!isAiMatchingAvailable()) {
      throw new AppError('AI matching is disabled. Use the skill match on the employer dashboard instead.', 400);
    }

    const aiEvaluation = await aiMatchService.evaluateApplication(applicationId);

    const updatedApplication = await ApplicationModel.findById(applicationId);

    return {
      message: 'AI match evaluation completed successfully.',
      application: formatApplication(updatedApplication),
      aiEvaluation,
    };
  },

  async updateStatus(
    employerId: string,
    applicationId: string,
    input: UpdateApplicationStatusInput
  ) {
    const application = await ApplicationModel.findById(applicationId);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const job = await JobModel.findById(application.jobId);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employerId.toString() !== employerId) {
      throw new AppError('Forbidden', 403);
    }

    application.status = input.status;
    await application.save();

    try {
      const candidate = await UserModel.findById(application.candidateId);

      if (candidate?.email) {
        await sendApplicationStatusUpdatedEmail({
          to: candidate.email,
          jobTitle: job.title,
          status: input.status,
        });
      }
    } catch (error) {
      console.error('Failed to send application status update email:', error);
    }

    return { application };
  },
};