import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/app-error';
import { resumeService } from './resume.service';
import { extractResumeText } from './resume-parser.service';
import { extractProfileSuggestions } from './resume-profile-extractor';
import { detectFileType } from '../../lib/storage';

export const uploadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('Resume file is required', 400);
    }

    const result = await resumeService.upload(req.user!.userId, req.file as Express.Multer.File);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Parse a resume and return profile suggestions without storing anything (#34).
 * The file stays in memory; only the suggestions are returned to the candidate.
 */
export const parseResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('Resume file is required', 400);
    }
    const type = detectFileType(req.file.buffer);
    if (type !== 'pdf' && type !== 'docx') {
      throw new AppError('The file content does not match an allowed file type', 400);
    }
    const text = await extractResumeText(req.file);
    res.json({ suggestions: extractProfileSuggestions(text) });
  } catch (error) {
    next(error);
  }
};
