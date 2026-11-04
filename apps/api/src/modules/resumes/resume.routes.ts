import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { AppError } from '../../utils/app-error';
import { parseResume, uploadResume } from './resume.controller';

const router = Router();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const allowedExtensions = ['.pdf', '.docx'];

function sanitizeOriginalName(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '');
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
    const isExtensionAllowed = allowedExtensions.includes(extension);

    if (!isMimeAllowed || !isExtensionAllowed) {
      return cb(new AppError('Only PDF and DOCX files are allowed', 400));
    }

    file.originalname = sanitizeOriginalName(file.originalname);
    cb(null, true);
  },
});

/**
 * @swagger
 * /api/v1/resumes/upload:
 *   post:
 *     summary: Upload candidate resume
*     description: Uploads a PDF or DOCX resume file to cloud storage and saves its URL and extracted text on the candidate profile. Can be used before or after onboarding step 2.
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid file or missing file
 *       403:
 *         description: Forbidden
 */
router.post(
  '/upload',
  requireAuth,
  requireRole('TALENT'),
  (req, res, next) => {
    upload.single('resume')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('Resume file must be 5 MB or smaller', 400));
        }

        return next(new AppError(`Upload error: ${err.message}`, 400));
      }

      if (err) {
        return next(err);
      }

      next();
    });
  },
  uploadResume
);

/**
 * @swagger
 * /api/v1/resumes/parse:
 *   post:
 *     summary: Suggest profile fields from a resume (nothing is stored)
 *     tags: [Resumes]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/parse',
  requireAuth,
  requireRole('TALENT'),
  (req, res, next) => {
    upload.single('resume')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return next(new AppError(err.code === 'LIMIT_FILE_SIZE' ? 'Resume file must be 5 MB or smaller' : `Upload error: ${err.message}`, 400));
      }
      if (err) return next(err);
      next();
    });
  },
  parseResume
);

export default router;