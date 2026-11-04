import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppError } from '../../utils/app-error';
import { env } from '../../config/env';
import { UserModel } from '../users/user.model';
import { OtpCodeModel } from '../auth/otp-code.model';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { EmployerProfileModel } from '../employers/employer.model';
import { RefreshTokenModel } from '../auth/refresh-token.model';
import { generateOtp } from '../../utils/generate-otp';
import { generateTokens } from '../../utils/generate-tokens';
import { sendVerificationOtpEmail } from '../../lib/mailgun';
import {
  CandidateStep2Input,
  CandidateStep3Input,
  OnboardingRegisterInput,
  OnboardingVerifyEmailInput,
  RecruiterStep2Input,
  RecruiterStep3Input,
} from './onboarding.schemas';

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || parts[0] || '';
  return { firstName, lastName };
}

function mapUiRoleToAccountType(role: 'Candidate' | 'Recruiter'): 'TALENT' | 'EMPLOYER' {
  return role === 'Candidate' ? 'TALENT' : 'EMPLOYER';
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function getOtpExpiryDate(): Date {
  return new Date(Date.now() + Number(env.OTP_EXPIRES_MINUTES) * 60000);
}

function getRefreshTokenExpiryDate(): Date {
  let expiresMs = 0;
  const match = /^([0-9]+)([smhd])$/.exec(env.JWT_REFRESH_EXPIRES_IN);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit === 's') expiresMs = value * 1000;
    else if (unit === 'm') expiresMs = value * 60 * 1000;
    else if (unit === 'h') expiresMs = value * 60 * 60 * 1000;
    else if (unit === 'd') expiresMs = value * 24 * 60 * 60 * 1000;
  } else {
    expiresMs = Number(env.JWT_REFRESH_EXPIRES_IN) * 1000;
  }

  return new Date(Date.now() + expiresMs);
}

function normalizePrimaryHiringNeeds(primaryHiringNeeds?: string | string[]): string[] {
  if (!primaryHiringNeeds) {
    return [];
  }

  if (Array.isArray(primaryHiringNeeds)) {
    return primaryHiringNeeds.map((item) => item.trim()).filter(Boolean);
  }

  return primaryHiringNeeds
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function invalidateUnusedVerificationOtps(userId: string | object): Promise<void> {
  await OtpCodeModel.updateMany(
    { userId, type: 'VERIFY_EMAIL', usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } }
  );
}

export const onboardingService = {
  async register(input: OnboardingRegisterInput) {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
      throw new AppError('User already exists', 409);
    }

    const { firstName, lastName } = splitFullName(input.fullName);
    const accountType = mapUiRoleToAccountType(input.role);
    const passwordHash = await bcrypt.hash(input.password, Number(env.BCRYPT_ROUNDS));

    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      accountType,
      isVerified: false,
      status: 'PENDING_VERIFICATION',
      profile: {
        firstName,
        lastName,
      },
      agreedToTermsAt: new Date(),
      receiveUpdates: input.receiveUpdates ?? false,
      onboardingStep: 1,
      onboardingCompleted: false,
    });

    await invalidateUnusedVerificationOtps(user._id);

    const otp = generateOtp();

    await OtpCodeModel.create({
      userId: user._id,
      type: 'VERIFY_EMAIL',
      codeHash: hashOtp(otp),
      expiresAt: getOtpExpiryDate(),
      attemptCount: 0,
    });

    await sendVerificationOtpEmail(input.email, otp);

    return {
      message: 'Registration successful. Please verify your email to continue onboarding.',
      accountType,
      onboardingStep: 1,
    };
  },

  async verifyEmail(input: OnboardingVerifyEmailInput) {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const otpDoc = await OtpCodeModel.findOne({
      userId: user._id,
      type: 'VERIFY_EMAIL',
    }).sort({ createdAt: -1 });

    if (!otpDoc || otpDoc.usedAt || otpDoc.expiresAt < new Date()) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const incomingHash = hashOtp(input.otp);

    if (incomingHash !== otpDoc.codeHash) {
      otpDoc.attemptCount += 1;
      await otpDoc.save();
      throw new AppError('Invalid or expired OTP', 400);
    }

    otpDoc.usedAt = new Date();
    await otpDoc.save();

    user.isVerified = true;
    user.status = 'ACTIVE';
    user.onboardingStep = Math.max(user.onboardingStep ?? 1, 1);
    await user.save();

    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      accountType: user.accountType,
    });

    const refreshTokenHash = crypto.createHash('sha256').update(tokens.refreshToken).digest('hex');
    const expiresAt = getRefreshTokenExpiryDate();

    await RefreshTokenModel.create({
      userId: user._id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return {
      message: 'Email verified successfully. You can continue onboarding.',
      onboardingStep: user.onboardingStep,
      accountType: user.accountType,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        isVerified: user.isVerified,
        status: user.status,
        onboardingStep: user.onboardingStep ?? 1,
        onboardingCompleted: user.onboardingCompleted ?? false,
        receiveUpdates: user.receiveUpdates ?? false,
        agreedToTermsAt: user.agreedToTermsAt,
        profile: user.profile,
      },
    };
  },

  async resendVerification(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return { message: 'If the account exists, a new verification code has been sent.' };
    }

    await invalidateUnusedVerificationOtps(user._id);

    const otp = generateOtp();

    await OtpCodeModel.create({
      userId: user._id,
      type: 'VERIFY_EMAIL',
      codeHash: hashOtp(otp),
      expiresAt: getOtpExpiryDate(),
      attemptCount: 0,
    });

    await sendVerificationOtpEmail(email, otp);

    return { message: 'If the account exists, a new verification code has been sent.' };
  },

  async getStatus(userId: string) {
    const user = await UserModel.findById(userId).select(
      '_id email accountType isVerified status onboardingStep onboardingCompleted receiveUpdates agreedToTermsAt profile'
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        isVerified: user.isVerified,
        status: user.status,
        onboardingStep: user.onboardingStep ?? 1,
        onboardingCompleted: user.onboardingCompleted ?? false,
        receiveUpdates: user.receiveUpdates ?? false,
        agreedToTermsAt: user.agreedToTermsAt,
        profile: user.profile,
      },
    };
  },

  async saveCandidateStep2(userId: string, input: CandidateStep2Input) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.accountType !== 'TALENT') throw new AppError('Forbidden', 403);
    if (!user.isVerified) throw new AppError('Email must be verified before continuing onboarding', 403);

    const profile = await CandidateProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          phoneNumber: input.phoneNumber,
          location: input.location,
          jobTitleOrDesiredRole: input.jobTitleOrDesiredRole,
          yearsOfExperience: input.yearsOfExperience,
          linkedinUrl: input.linkedinUrl,
          ...(input.resumeUrl ? { resumeUrl: input.resumeUrl } : {}),
        },
      },
      { new: true, upsert: true }
    );

    user.onboardingStep = Math.max(user.onboardingStep ?? 1, 2);
    await user.save();

    return {
      message: 'Candidate onboarding step 2 saved successfully.',
      onboardingStep: user.onboardingStep,
      profile,
    };
  },

  async saveCandidateStep3(userId: string, input: CandidateStep3Input) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.accountType !== 'TALENT') throw new AppError('Forbidden', 403);
    if (!user.isVerified) throw new AppError('Email must be verified before continuing onboarding', 403);

    const profile = await CandidateProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          skills: input.skills,
          professionalSummary: input.professionalSummary,
          bio: input.professionalSummary,
        },
      },
      { new: true, upsert: true }
    );

    user.onboardingStep = 3;
    user.onboardingCompleted = true;
    await user.save();

    return {
      message: 'Candidate onboarding completed successfully.',
      onboardingStep: user.onboardingStep,
      onboardingCompleted: user.onboardingCompleted,
      profile,
    };
  },

  async saveRecruiterStep2(userId: string, input: RecruiterStep2Input) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.accountType !== 'EMPLOYER') throw new AppError('Forbidden', 403);
    if (!user.isVerified) throw new AppError('Email must be verified before continuing onboarding', 403);

    const profile = await EmployerProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          companyName: input.companyName,
          contactPhone: input.phoneNumber,
          companyWebsite: input.companyWebsite,
          industry: input.industry,
          companySize: input.companySize,
          location: input.location,
          yourRole: input.yourRole,
          jobTitle: input.jobTitle,
        },
      },
      { new: true, upsert: true }
    );

    user.onboardingStep = Math.max(user.onboardingStep ?? 1, 2);
    user.profile.companyName = input.companyName;
    user.profile.phone = input.phoneNumber ?? user.profile.phone;
    await user.save();

    return {
      message: 'Recruiter onboarding step 2 saved successfully.',
      onboardingStep: user.onboardingStep,
      profile,
    };
  },

  async saveRecruiterStep3(userId: string, input: RecruiterStep3Input) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.accountType !== 'EMPLOYER') throw new AppError('Forbidden', 403);
    if (!user.isVerified) throw new AppError('Email must be verified before continuing onboarding', 403);

    const profile = await EmployerProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          companyOverview: input.companyOverview,
          benefitsAndOpportunities: input.benefitsAndOpportunities,
          primaryHiringNeeds: normalizePrimaryHiringNeeds(input.primaryHiringNeeds),
          about: input.companyOverview,
        },
      },
      { new: true, upsert: true }
    );

    user.onboardingStep = 3;
    user.onboardingCompleted = true;
    await user.save();

    return {
      message: 'Recruiter onboarding completed successfully.',
      onboardingStep: user.onboardingStep,
      onboardingCompleted: user.onboardingCompleted,
      profile,
    };
  },
};