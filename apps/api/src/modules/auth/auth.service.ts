import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { OtpCodeModel } from './otp-code.model';
import { RegisterInput } from './auth.schemas';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { generateOtp } from '../../utils/generate-otp';
import { generateTokens } from '../../utils/generate-tokens';
import { RefreshTokenModel } from './refresh-token.model';
import { sendResetPasswordEmail, sendVerificationOtpEmail } from '../../lib/mailgun';
import crypto from 'crypto';

// === Internal helpers ===

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function getOtpExpiryDate(): Date {
  return new Date(Date.now() + Number(env.OTP_EXPIRES_MINUTES) * 60000);
}

async function invalidateUnusedOtps(
  userId: any,
  type: 'VERIFY_EMAIL' | 'RESET_PASSWORD'
): Promise<void> {
  await OtpCodeModel.updateMany(
    { userId, type, usedAt: { $exists: false } },
    { $set: { usedAt: new Date() } }
  );
}

async function createOtpRecord(
  userId: any,
  type: 'VERIFY_EMAIL' | 'RESET_PASSWORD',
  codeHash: string,
  expiresAt: Date
): Promise<void> {
  await OtpCodeModel.create({
    userId,
    type,
    codeHash,
    expiresAt,
    attemptCount: 0,
  });
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

// === Auth Service ===

export const authService = {
  async register(input: RegisterInput) {
    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, Number(env.BCRYPT_ROUNDS));

    const user = await UserModel.create({
      email: input.email,
      passwordHash,
      accountType: input.accountType,
      isVerified: false,
      status: 'PENDING_VERIFICATION',
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        companyName: input.companyName,
        avatarUrl: input.avatarUrl,
      },
    });

    await invalidateUnusedOtps(user._id, 'VERIFY_EMAIL');

    const otp = generateOtp();

    const codeHash = hashOtp(otp);
    const expiresAt = getOtpExpiryDate();

    await createOtpRecord(user._id, 'VERIFY_EMAIL', codeHash, expiresAt);

    await sendVerificationOtpEmail(input.email, otp);

    return { message: 'Registration successful. Please verify your email with the OTP sent.' };
  },

  async verifyOtp(input: { email: string; otp: string; type: 'VERIFY_EMAIL' | 'RESET_PASSWORD' }) {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const otpDoc = await OtpCodeModel.findOne({ userId: user._id, type: input.type }).sort({ createdAt: -1 });
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

    if (input.type === 'VERIFY_EMAIL') {
      user.isVerified = true;
      user.status = 'ACTIVE';
      user.lastLoginAt = new Date();
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

      return {
        message: 'Email verified successfully.',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id,
          email: user.email,
          accountType: user.accountType,
          isVerified: user.isVerified,
          status: user.status,
          profile: user.profile,
        },
      };
    }

    return { message: 'OTP verified successfully.' };
  },

  async resendOtp(input: { email: string; type: 'VERIFY_EMAIL' | 'RESET_PASSWORD' }) {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      return { message: 'If the account exists, a new OTP has been sent.' };
    }

    await invalidateUnusedOtps(user._id, input.type);

    const otp = generateOtp();

    const codeHash = hashOtp(otp);
    const expiresAt = getOtpExpiryDate();

    await createOtpRecord(user._id, input.type, codeHash, expiresAt);

    if (input.type === 'VERIFY_EMAIL') {
      await sendVerificationOtpEmail(input.email, otp);
    } else {
      await sendResetPasswordEmail(input.email, otp);
    }

    return { message: 'If the account exists, a new OTP has been sent.' };
  },

  async login(input: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isVerified || user.status !== 'ACTIVE') {
      throw new AppError('Account is not active or verified', 403);
    }

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
      message: 'Login successful.',
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
        profile: user.profile,
      },
    };
  },

  async forgotPassword(input: { email: string }) {
    const user = await UserModel.findOne({ email: input.email });

    if (!user) {
      return { message: 'If the account exists, password reset instructions have been sent.' };
    }

    await invalidateUnusedOtps(user._id, 'RESET_PASSWORD');

    const otp = generateOtp();

    const codeHash = hashOtp(otp);
    const expiresAt = getOtpExpiryDate();

    await createOtpRecord(user._id, 'RESET_PASSWORD', codeHash, expiresAt);

    await sendResetPasswordEmail(input.email, otp);

    return { message: 'If the account exists, password reset instructions have been sent.' };
  },

  async resetPassword(input: { email: string; otp: string; newPassword: string }) {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const otpDoc = await OtpCodeModel.findOne({ userId: user._id, type: 'RESET_PASSWORD' }).sort({ createdAt: -1 });
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

    const passwordHash = await bcrypt.hash(input.newPassword, Number(env.BCRYPT_ROUNDS));
    user.passwordHash = passwordHash;
    await user.save();

    await RefreshTokenModel.updateMany(
      { userId: user._id, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date() } }
    );

    return { message: 'Password reset successfully.' };
  },

  async refreshToken(input: { refreshToken: string }) {
    let decoded: { userId: string; email: string; accountType: 'EMPLOYER' | 'TALENT' | 'ADMIN' };

    try {
      decoded = jwt.verify(input.refreshToken, env.JWT_REFRESH_SECRET as Secret) as {
        userId: string;
        email: string;
        accountType: 'EMPLOYER' | 'TALENT' | 'ADMIN';
      };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenHash = crypto.createHash('sha256').update(input.refreshToken).digest('hex');

    const storedToken = await RefreshTokenModel.findOne({
      userId: decoded.userId,
      tokenHash,
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Suspended or deleted accounts cannot get new access tokens
    const tokenOwner = await UserModel.findById(decoded.userId).select('status');
    if (!tokenOwner || tokenOwner.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 403);
    }

    const accessOptions: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        accountType: decoded.accountType,
      },
      env.JWT_ACCESS_SECRET as Secret,
      accessOptions
    );

    return {
      message: 'Token refreshed successfully.',
      accessToken,
      refreshToken: input.refreshToken,
    };
  },

  async me(userId: string) {
    const user = await UserModel.findById(userId).select(
      '_id email accountType isVerified status profile lastLoginAt createdAt updatedAt'
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
        profile: user.profile,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  },
};