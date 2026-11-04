/**
 * Account self-service and candidate recommendations.
 *  POST   /api/v1/auth/logout                 revoke the refresh token (#56)
 *  DELETE /api/v1/account                     delete my account and data, password required (#58)
 *  GET    /api/v1/recommendations/jobs        open jobs ranked for the signed-in candidate (#52)
 * Author: Ryan Naidji
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { validateRequest } from '../../middleware/validate-request';
import { AppError } from '../../utils/app-error';
import { formatJob } from '../../utils/response-formatters';
import { deleteStoredFile } from '../../lib/storage';
import { adminService } from '../admin/admin.service';
import { ApplicationModel } from '../applications/application.model';
import { RefreshTokenModel } from '../auth/refresh-token.model';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { EmployerProfileModel } from '../employers/employer.model';
import { JobModel } from '../jobs/job.model';
import { UserModel } from '../users/user.model';
import { calculateSkillScore, getTextMatchScore, getTitleMatchScore } from '../dashboard/dashboard.service';

const router = Router();

/** Remove every uploaded file that belongs to a user (resumes, cover letters, logo). */
export async function deleteUserFiles(userId: string) {
  const [profile, employer, applications] = await Promise.all([
    CandidateProfileModel.findOne({ userId }).select('resumeUrl').lean(),
    EmployerProfileModel.findOne({ userId }).select('logoUrl').lean(),
    ApplicationModel.find({ candidateId: userId }).select('resumeFileUrl coverLetterFileUrl').lean(),
  ]);
  const urls = [
    profile?.resumeUrl,
    (employer as { logoUrl?: string } | null)?.logoUrl,
    ...applications.flatMap((a: { resumeFileUrl?: string; coverLetterFileUrl?: string }) => [a.resumeFileUrl, a.coverLetterFileUrl]),
  ];
  await Promise.all(urls.map((u) => deleteStoredFile(u)));
}

// ---- Logout (#56): the refresh token can no longer be used, even if it was copied
const logoutSchema = z.object({ refreshToken: z.string().min(1).optional() });
router.post('/api/v1/auth/logout', validateRequest(logoutSchema), async (req, res, next) => {
  try {
    const token: string | undefined = req.body.refreshToken;
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await RefreshTokenModel.updateOne({ tokenHash, revokedAt: null }, { $set: { revokedAt: new Date() } });
    }
    res.json({ message: 'Signed out.' });
  } catch (error) {
    next(error);
  }
});

// ---- Self-service account deletion (#58)
const deleteSchema = z.object({ password: z.string().min(1) });
router.delete('/api/v1/account', requireAuth, validateRequest(deleteSchema), async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.accountType === 'ADMIN') throw new AppError('Admin accounts cannot be deleted here', 403);
    const valid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) throw new AppError('Incorrect password', 401);

    await deleteUserFiles(user._id.toString());
    await adminService.deleteUser(user._id.toString());
    res.json({ message: 'Your account and its data have been deleted.' });
  } catch (error) {
    next(error);
  }
});

// ---- Recommended jobs for the signed-in candidate (#52), rule-based (no AI)
router.get('/api/v1/recommendations/jobs', requireAuth, requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await CandidateProfileModel.findOne({ userId: req.user!.userId })
      .select('skills jobTitleOrDesiredRole headline professionalSummary')
      .lean();
    const applied = new Set(
      (await ApplicationModel.find({ candidateId: req.user!.userId }).select('jobId').lean()).map((a) => String(a.jobId))
    );
    const jobs = await JobModel.find({ status: 'OPEN' }).sort({ createdAt: -1 }).limit(300);
    const candidateTitle = profile?.jobTitleOrDesiredRole || profile?.headline || '';
    const candidateText = [candidateTitle, profile?.professionalSummary, ...(profile?.skills || [])].filter(Boolean).join(' ');

    const ranked = jobs
      .filter((job) => !applied.has(String(job._id)))
      .map((job) => {
        const { skillScore, matchedSkills } = calculateSkillScore(job.skills || [], profile?.skills || []);
        const score =
          skillScore +
          getTitleMatchScore(job.title, candidateTitle) +
          getTextMatchScore([job.title, job.description, job.requirements].filter(Boolean).join(' '), candidateText);
        return { job: formatJob(job), score: Math.min(100, score), matchedSkills };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ recommendations: ranked, profileComplete: Boolean(profile?.skills?.length || candidateTitle) });
  } catch (error) {
    next(error);
  }
});

export default router;
