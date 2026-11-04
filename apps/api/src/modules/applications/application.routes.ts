import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { validateRequest } from '../../middleware/validate-request';
import { AppError } from '../../utils/app-error';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from './application.schemas';
import {
  createApplication,
  getMyApplications,
  getApplicationsForJobByQuery,
  getApplicationsForJob,
  updateApplicationStatus,
  retryApplicationAiMatch,
} from './application.controller';

const router = Router();

const allowedCoverLetterMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const allowedCoverLetterExtensions = ['.pdf', '.docx'];

function sanitizeOriginalName(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '');
}

const coverLetterUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const isMimeAllowed = allowedCoverLetterMimeTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedCoverLetterExtensions.includes(extension);

    if (!isMimeAllowed || !isExtensionAllowed) {
      return cb(new AppError('Only PDF and DOCX cover letter files are allowed', 400));
    }

    file.originalname = sanitizeOriginalName(file.originalname);
    cb(null, true);
  },
});

function handleApplicationUpload(req: any, res: any, next: any) {
  coverLetterUpload.fields([
    { name: 'resumeFile', maxCount: 1 },
    { name: 'coverLetterFile', maxCount: 1 },
  ])(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError('Uploaded files must be 5 MB or smaller', 400)
        );
      }

      return next(new AppError(`Upload error: ${err.message}`, 400));
    }

    if (err) {
      return next(err);
    }

    next();
  });
}

function handleCoverLetterUploadold(req: any, res: any, next: any) {
  coverLetterUpload.single('coverLetterFile')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('Cover letter file must be 5 MB or smaller', 400));
      }

      return next(new AppError(`Upload error: ${err.message}`, 400));
    }

    if (err) {
      return next(err);
    }

    next();
  });
}

/**
 * @swagger
 * /api/v1/applications:
 *   post:
 *     summary: Apply to a job
 *     description: Apply to a job using a plain text cover letter, or optionally upload a PDF/DOCX cover letter file using multipart/form-data.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *                 description: Optional plain text cover letter.
 *               coverLetterFile:
 *                 type: string
 *                 format: binary
 *                 description: Optional PDF or DOCX cover letter file.
 *     responses:
 *       201:
 *         description: Application created successfully
 *       409:
 *         description: Candidate already applied to this job
 */
router.post(
  '/',
  // Only signed-in candidates can apply (#19)
  requireAuth,
  requireRole('TALENT'),
  handleApplicationUpload,
  validateRequest(createApplicationSchema),
  createApplication
);

/**
 * @swagger
 * /api/v1/applications/my-applications:
 *   get:
 *     summary: Get applications of the authenticated candidate
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidate applications returned successfully
 */
router.get(
  '/my-applications',
  requireAuth,
  requireRole('TALENT'),
  getMyApplications
);

/**
 * @swagger
 * /api/v1/applications/job/{jobId}:
 *   get:
 *     summary: Get applications for a specific job
 *     description: Returns applications for a job, including candidate profile data, AI match score, confidence score, evidence, and freshness status.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of applications per page.
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [newest, oldest, aiScore, aiScoreLow]
 *           default: newest
 *         description: Sort applications by newest, oldest, highest AI score, or lowest AI score.
 *       - in: query
 *         name: recommendation
 *         required: false
 *         schema:
 *           type: string
 *           enum: [STRONG_MATCH, GOOD_MATCH, PARTIAL_MATCH, LOW_MATCH]
 *         description: Filter applications by AI recommendation.
 *       - in: query
 *         name: confidenceLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *         description: Filter applications by AI confidence level.
 *       - in: query
 *         name: aiMatchStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [NOT_STARTED, PENDING, COMPLETED, FAILED, SKIPPED]
 *         description: Filter applications by AI match status.
 *       - in: query
 *         name: staleOnly
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, only returns applications whose AI evaluation is outdated.
 *     responses:
 *       200:
 *         description: Applications for job returned successfully
 *       404:
 *         description: Job not found
 */
router.get(
  '/',
  requireAuth,
  requireRole('EMPLOYER'),
  getApplicationsForJobByQuery
);

/**
 * @swagger
 * /api/v1/applications/job/{jobId}:
 *   get:
 *     summary: Get applications for a specific job
 *     description: Returns applications for a job, including candidate profile data, AI match score, confidence score, evidence, and freshness status.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of applications per page.
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [newest, oldest, aiScore, aiScoreLow]
 *           default: newest
 *         description: Sort applications by newest, oldest, highest AI score, or lowest AI score.
 *       - in: query
 *         name: recommendation
 *         required: false
 *         schema:
 *           type: string
 *           enum: [STRONG_MATCH, GOOD_MATCH, PARTIAL_MATCH, LOW_MATCH]
 *         description: Filter applications by AI recommendation.
 *       - in: query
 *         name: confidenceLevel
 *         required: false
 *         schema:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *         description: Filter applications by AI confidence level.
 *       - in: query
 *         name: aiMatchStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [NOT_STARTED, PENDING, COMPLETED, FAILED, SKIPPED]
 *         description: Filter applications by AI match status.
 *       - in: query
 *         name: staleOnly
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, only returns applications whose AI evaluation is outdated.
 *     responses:
 *       200:
 *         description: Applications for job returned successfully
 *       404:
 *         description: Job not found
 */
router.get(
  '/job/:jobId',
  requireAuth,
  requireRole('EMPLOYER'),
  getApplicationsForJob
);

/**
 * @swagger
 * /api/v1/applications/{id}/ai-match/retry:
 *   post:
 *     summary: Retry AI match evaluation for an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: AI match evaluation completed successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application or job not found
 */
router.post(
  '/:id/ai-match/retry',
  requireAuth,
  requireRole('EMPLOYER'),
  retryApplicationAiMatch
);

/**
 * @swagger
 * /api/v1/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REVIEWED, SHORTLISTED, REJECTED, HIRED]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       404:
 *         description: Application not found
 */
router.patch(
  '/:id/status',
  requireAuth,
  requireRole('EMPLOYER'),
  validateRequest(updateApplicationStatusSchema),
  updateApplicationStatus
);

export default router;