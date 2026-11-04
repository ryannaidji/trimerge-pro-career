import crypto from 'crypto';
import OpenAI from 'openai';
import { Types } from 'mongoose';
import { AppError } from '../../utils/app-error';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { JobModel } from '../jobs/job.model';
import { ApplicationModel } from '../applications/application.model';
import { AiMatchEvaluationModel } from './ai-match.model';
import { AI_MATCH_PROMPT_VERSION, buildAiMatchPrompt } from './ai-match.prompt';
import {
  AiConfidenceLevel,
  AiRecommendation,
  EvidenceMatchLevel,
  EvidenceSource,
} from './ai-match.types';

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const AI_MATCHING_ENABLED = process.env.AI_MATCHING_ENABLED !== 'false';

// Created on first use so the API can start without OPENAI_API_KEY (AI matching is optional)
let openaiClient: OpenAI | null = null;
function getOpenAI() {
  openaiClient ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

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

function getRecommendation(overallScore: number): AiRecommendation {
  if (overallScore >= 85) return 'STRONG_MATCH';
  if (overallScore >= 70) return 'GOOD_MATCH';
  if (overallScore >= 50) return 'PARTIAL_MATCH';
  return 'LOW_MATCH';
}

function getConfidenceLevel(confidenceScore: number): AiConfidenceLevel {
  if (confidenceScore >= 80) return 'HIGH';
  if (confidenceScore >= 50) return 'MEDIUM';
  return 'LOW';
}

function clampScore(score: number) {
  const numericScore = Number(score);

  if (Number.isNaN(numericScore)) return 0;

  return Math.max(0, Math.min(100, Math.round(numericScore)));
}

function safeStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeEvidence(value: unknown) {
  if (!Array.isArray(value)) return [];

  const allowedSources: EvidenceSource[] = [
    'RESUME',
    'COVER_LETTER',
    'PROFILE',
    'JOB_DESCRIPTION',
    'INFERRED',
  ];

  const allowedMatchLevels: EvidenceMatchLevel[] = [
    'STRONG',
    'MODERATE',
    'WEAK',
    'MISSING',
  ];

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item: any) => {
      const source = allowedSources.includes(item.source) ? item.source : 'INFERRED';
      const matchLevel = allowedMatchLevels.includes(item.matchLevel)
        ? item.matchLevel
        : 'WEAK';

      return {
        criterion:
          typeof item.criterion === 'string' && item.criterion.trim()
            ? item.criterion.trim()
            : 'Unspecified criterion',
        matchLevel,
        evidence:
          typeof item.evidence === 'string' && item.evidence.trim()
            ? item.evidence.trim()
            : 'No specific evidence provided.',
        source,
      };
    })
    .slice(0, 15);
}

function normalizeAiResult(result: any) {
  const overallScore = clampScore(result.overallScore);
  const confidenceScore = clampScore(result.confidenceScore);

  return {
    overallScore,
    recommendation: getRecommendation(overallScore),

    confidenceScore,
    confidenceLevel: getConfidenceLevel(confidenceScore),
    confidenceReason:
      typeof result.confidenceReason === 'string' && result.confidenceReason.trim()
        ? result.confidenceReason.trim()
        : 'Confidence was estimated based on the available resume, profile, cover letter, and job description evidence.',

    scoreBreakdown: {
      skills: clampScore(result.scoreBreakdown?.skills),
      experience: clampScore(result.scoreBreakdown?.experience),
      education: clampScore(result.scoreBreakdown?.education),
      seniority: clampScore(result.scoreBreakdown?.seniority),
      locationFit: clampScore(result.scoreBreakdown?.locationFit),
      resumeQuality: clampScore(result.scoreBreakdown?.resumeQuality),
      coverLetterAlignment: clampScore(result.scoreBreakdown?.coverLetterAlignment),
    },

    matchedSkills: safeStringArray(result.matchedSkills, 20),
    missingSkills: safeStringArray(result.missingSkills, 20),

    requiredSkillsMatched: safeStringArray(result.requiredSkillsMatched, 20),
    requiredSkillsMissing: safeStringArray(result.requiredSkillsMissing, 20),
    preferredSkillsMatched: safeStringArray(result.preferredSkillsMatched, 20),
    preferredSkillsMissing: safeStringArray(result.preferredSkillsMissing, 20),

    strengths: safeStringArray(result.strengths, 10),
    concerns: safeStringArray(result.concerns, 10),

    evidence: normalizeEvidence(result.evidence),

    recruiterSummary:
      typeof result.recruiterSummary === 'string' && result.recruiterSummary.trim()
        ? result.recruiterSummary.trim()
        : 'AI evaluation completed.',

    detailedRecruiterAnalysis:
      typeof result.detailedRecruiterAnalysis === 'string' &&
      result.detailedRecruiterAnalysis.trim()
        ? result.detailedRecruiterAnalysis.trim()
        : 'The candidate was evaluated against the job description using available resume, profile, and cover letter information.',

    candidateMessage:
      typeof result.candidateMessage === 'string' && result.candidateMessage.trim()
        ? result.candidateMessage.trim()
        : 'Thank you for applying. Your application has been received and is under review.',
  };
}

export const aiMatchService = {
  async evaluateApplication(applicationId: string) {
    if (!AI_MATCHING_ENABLED) {
      return null;
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new AppError('OpenAI API key is not configured', 500);
    }

    const application = await ApplicationModel.findById(applicationId);

    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const [job, candidateProfile] = await Promise.all([
      JobModel.findById(application.jobId),
      CandidateProfileModel.findOne({ userId: application.candidateId }),
    ]);

    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (!candidateProfile) {
      await ApplicationModel.findByIdAndUpdate(applicationId, {
        $set: {
          aiMatchStatus: 'SKIPPED',
          aiError: 'Candidate profile not found',
        },
      });

      return null;
    }

    if (
      candidateProfile.resumeParsingStatus !== 'SUCCESS' ||
      !candidateProfile.resumeText ||
      candidateProfile.resumeText.trim().length < 50
    ) {
      await ApplicationModel.findByIdAndUpdate(applicationId, {
        $set: {
          aiMatchStatus: 'SKIPPED',
          aiError: 'Candidate resume text is not available',
        },
      });

      return null;
    }

    await ApplicationModel.findByIdAndUpdate(applicationId, {
      $set: {
        aiMatchStatus: 'PENDING',
      },
      $unset: {
        aiError: '',
      },
    });

    const prompt = buildAiMatchPrompt({
      jobTitle: job.title,
      jobDescription: job.description,
      jobRequirements: job.requirements,
      jobSkills: job.skills || [],
      jobLocation: job.location,
      employmentType: job.employmentType,
      candidateResumeText: candidateProfile.resumeText,
      candidateCoverLetter: application.coverLetter,
      candidateProfile: {
        headline: candidateProfile.headline,
        skills: candidateProfile.skills,
        experienceLevel: candidateProfile.experienceLevel,
        location: candidateProfile.location,
        bio: candidateProfile.bio,
        jobTitleOrDesiredRole: candidateProfile.jobTitleOrDesiredRole,
        yearsOfExperience: candidateProfile.yearsOfExperience,
        professionalSummary: candidateProfile.professionalSummary,
      },
    });

    const jobSnapshot = buildJobSnapshot(job);
    const resumeTextHash = createHash(candidateProfile.resumeText);
    const coverLetterHash = application.coverLetter ? createHash(application.coverLetter) : undefined;
    const jobContentHash = createHash(jobSnapshot);

    try {
      const response = await getOpenAI().responses.create({
        model: AI_MODEL,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'candidate_match_evaluation',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                overallScore: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                },
                confidenceScore: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                },
                confidenceReason: {
                  type: 'string',
                },
                scoreBreakdown: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    skills: { type: 'number', minimum: 0, maximum: 100 },
                    experience: { type: 'number', minimum: 0, maximum: 100 },
                    education: { type: 'number', minimum: 0, maximum: 100 },
                    seniority: { type: 'number', minimum: 0, maximum: 100 },
                    locationFit: { type: 'number', minimum: 0, maximum: 100 },
                    resumeQuality: { type: 'number', minimum: 0, maximum: 100 },
                    coverLetterAlignment: { type: 'number', minimum: 0, maximum: 100 },
                  },
                  required: [
                    'skills',
                    'experience',
                    'education',
                    'seniority',
                    'locationFit',
                    'resumeQuality',
                    'coverLetterAlignment',
                  ],
                },
                matchedSkills: {
                  type: 'array',
                  items: { type: 'string' },
                },
                missingSkills: {
                  type: 'array',
                  items: { type: 'string' },
                },
                requiredSkillsMatched: {
                  type: 'array',
                  items: { type: 'string' },
                },
                requiredSkillsMissing: {
                  type: 'array',
                  items: { type: 'string' },
                },
                preferredSkillsMatched: {
                  type: 'array',
                  items: { type: 'string' },
                },
                preferredSkillsMissing: {
                  type: 'array',
                  items: { type: 'string' },
                },
                strengths: {
                  type: 'array',
                  items: { type: 'string' },
                },
                concerns: {
                  type: 'array',
                  items: { type: 'string' },
                },
                evidence: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      criterion: { type: 'string' },
                      matchLevel: {
                        type: 'string',
                        enum: ['STRONG', 'MODERATE', 'WEAK', 'MISSING'],
                      },
                      evidence: { type: 'string' },
                      source: {
                        type: 'string',
                        enum: [
                          'RESUME',
                          'COVER_LETTER',
                          'PROFILE',
                          'JOB_DESCRIPTION',
                          'INFERRED',
                        ],
                      },
                    },
                    required: ['criterion', 'matchLevel', 'evidence', 'source'],
                  },
                },
                recruiterSummary: {
                  type: 'string',
                },
                detailedRecruiterAnalysis: {
                  type: 'string',
                },
                candidateMessage: {
                  type: 'string',
                },
              },
              required: [
                'overallScore',
                'confidenceScore',
                'confidenceReason',
                'scoreBreakdown',
                'matchedSkills',
                'missingSkills',
                'requiredSkillsMatched',
                'requiredSkillsMissing',
                'preferredSkillsMatched',
                'preferredSkillsMissing',
                'strengths',
                'concerns',
                'evidence',
                'recruiterSummary',
                'detailedRecruiterAnalysis',
                'candidateMessage',
              ],
            },
          },
        },
      });

      const rawResult = JSON.parse(response.output_text);
      const normalizedResult = normalizeAiResult(rawResult);

      const evaluation = await AiMatchEvaluationModel.findOneAndUpdate(
        { applicationId: new Types.ObjectId(applicationId) },
        {
          $set: {
            applicationId: application._id,
            candidateId: application.candidateId,
            jobId: application.jobId,

            overallScore: normalizedResult.overallScore,
            recommendation: normalizedResult.recommendation,

            confidenceScore: normalizedResult.confidenceScore,
            confidenceLevel: normalizedResult.confidenceLevel,
            confidenceReason: normalizedResult.confidenceReason,

            scoreBreakdown: normalizedResult.scoreBreakdown,

            matchedSkills: normalizedResult.matchedSkills,
            missingSkills: normalizedResult.missingSkills,

            requiredSkillsMatched: normalizedResult.requiredSkillsMatched,
            requiredSkillsMissing: normalizedResult.requiredSkillsMissing,
            preferredSkillsMatched: normalizedResult.preferredSkillsMatched,
            preferredSkillsMissing: normalizedResult.preferredSkillsMissing,

            strengths: normalizedResult.strengths,
            concerns: normalizedResult.concerns,

            evidence: normalizedResult.evidence,

            recruiterSummary: normalizedResult.recruiterSummary,
            detailedRecruiterAnalysis: normalizedResult.detailedRecruiterAnalysis,
            candidateMessage: normalizedResult.candidateMessage,

            jobSnapshot,
            resumeTextHash,
            coverLetterHash,
            jobContentHash,

            aiModel: AI_MODEL,
            promptVersion: AI_MATCH_PROMPT_VERSION,
            rawResponse: rawResult,
          },
        },
        { new: true, upsert: true }
      );

      application.aiMatchStatus = 'COMPLETED';
      application.aiEvaluationId = evaluation._id;
      application.aiOverallScore = normalizedResult.overallScore;
      application.aiRecommendation = normalizedResult.recommendation;
      application.aiEvaluatedAt = new Date();
      application.aiError = undefined;

      await application.save();

      return evaluation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI matching failed';

      await ApplicationModel.findByIdAndUpdate(applicationId, {
        $set: {
          aiMatchStatus: 'FAILED',
          aiError: message,
        },
      });

      throw new AppError(`AI matching failed: ${message}`, 500);
    }
  },
};