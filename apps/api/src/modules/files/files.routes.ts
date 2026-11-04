/**
 * Private document downloads (#59).
 * Resumes and cover letters are no longer public: they are served only to
 *  - the candidate who owns them,
 *  - an employer who received an application referencing the candidate's documents,
 *  - administrators.
 * Company logos stay public (they are shown on job postings).
 * Author: Ryan Naidji
 */
import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { env } from '../../config/env';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../utils/app-error';
import { escapeRegex } from '../../utils/escape-regex';
import { ApplicationModel } from '../applications/application.model';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { JobModel } from '../jobs/job.model';

const router = Router();
const PRIVATE_FOLDERS = new Set(['resumes', 'cover-letters']);
const SAFE_NAME = /^[a-f0-9]{32}\.[a-z0-9]{1,5}$/;

/** True if the user may read this stored file. */
async function canRead(user: { userId: string; accountType: string }, folder: string, name: string) {
  if (user.accountType === 'ADMIN') return true;
  const suffix = new RegExp(`/${escapeRegex(folder)}/${escapeRegex(name)}$`);

  // Owner: the candidate's profile resume, or a document on one of their applications
  const profile = await CandidateProfileModel.findOne({ resumeUrl: suffix }).select('userId').lean();
  const applications = await ApplicationModel.find({ $or: [{ resumeFileUrl: suffix }, { coverLetterFileUrl: suffix }] })
    .select('candidateId jobId')
    .lean();
  const ownerId = profile?.userId?.toString() ?? applications[0]?.candidateId?.toString();
  if (!ownerId) return false;
  if (user.accountType === 'TALENT') return ownerId === user.userId;

  if (user.accountType === 'EMPLOYER') {
    // The employer must have received an application from this candidate
    const myJobIds = (await JobModel.find({ employerId: user.userId }).select('_id').lean()).map((j) => j._id);
    if (myJobIds.length === 0) return false;
    const applied = await ApplicationModel.exists({ candidateId: ownerId, jobId: { $in: myJobIds } });
    return Boolean(applied);
  }
  return false;
}

router.get('/:folder/:name', requireAuth, async (req, res, next) => {
  try {
    const { folder, name } = req.params;
    if (!PRIVATE_FOLDERS.has(folder) || !SAFE_NAME.test(name)) throw new AppError('Not Found', 404);
    if (!(await canRead(req.user!, folder, name))) throw new AppError('Forbidden', 403);

    const filePath = path.resolve(process.cwd(), env.UPLOADS_DIR, folder, name);
    if (!fs.existsSync(filePath)) throw new AppError('Not Found', 404);

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Disposition', `attachment; filename="${folder === 'resumes' ? 'resume' : 'cover-letter'}${path.extname(name)}"`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

export default router;
