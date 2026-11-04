import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { validateRequest } from '../../middleware/validate-request';
import {
  createCandidateProfileSchema,
  updateCandidateProfileSchema,
} from './candidate.schemas';
import {
  createCandidateProfile,
  getMyCandidateProfile,
  updateMyCandidateProfile,
  getCandidateProfileById,
} from './candidate.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/candidates:
 *   post:
 *     summary: Create candidate profile
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               headline:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceLevel:
 *                 type: string
 *               location:
 *                 type: string
 *               bio:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Candidate profile created successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  requireAuth,
  requireRole('TALENT'),
  validateRequest(createCandidateProfileSchema),
  createCandidateProfile
);

/**
 * @swagger
 * /api/v1/candidates/me:
 *   get:
 *     summary: Get current candidate profile
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Candidate profile returned successfully
 *       404:
 *         description: Candidate profile not found
 */
router.get(
  '/me',
  requireAuth,
  requireRole('TALENT'),
  getMyCandidateProfile
);

/**
 * @swagger
 * /api/v1/candidates/me:
 *   put:
 *     summary: Update current candidate profile
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               headline:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceLevel:
 *                 type: string
 *               location:
 *                 type: string
 *               bio:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Candidate profile updated successfully
 *       404:
 *         description: Candidate profile not found
 */
router.put(
  '/me',
  requireAuth,
  requireRole('TALENT'),
  validateRequest(updateCandidateProfileSchema),
  updateMyCandidateProfile
);

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   get:
 *     summary: Get candidate profile by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate profile ID
 *     responses:
 *       200:
 *         description: Candidate profile returned successfully
 *       404:
 *         description: Candidate profile not found
 */
router.get(
  '/:id',
  requireAuth,
  // Candidate profiles contain personal data: employers and admins only (#19)
  requireRole('EMPLOYER', 'ADMIN'),
  getCandidateProfileById
);

export default router;