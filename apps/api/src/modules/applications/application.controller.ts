import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/app-error';
import { applicationService } from './application.service';

export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as {
      resumeFile?: Express.Multer.File[];
      coverLetterFile?: Express.Multer.File[];
    };

    const resumeFile = files?.resumeFile?.[0];
    const coverLetterFile = files?.coverLetterFile?.[0];

    const result = await applicationService.create(
      req.user?.userId ?? null,
      req.body,
      resumeFile,
      coverLetterFile
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};


export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
   // const result = await applicationService.getMyApplications(req.user?.userId ?? null, page, limit);
    const result = await applicationService.getMyApplications(req.user!.userId, page, limit);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsForJobByQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const jobId = String(req.query.jobId ?? '').trim();

    if (!jobId) {
      throw new AppError('jobId query parameter is required', 400);
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const result = await applicationService.getApplicationsForJob(req.user!.userId, jobId, {
      page,
      limit,
      sortBy: String(req.query.sortBy ?? 'newest'),
      recommendation: req.query.recommendation ? String(req.query.recommendation) : undefined,
      confidenceLevel: req.query.confidenceLevel ? String(req.query.confidenceLevel) : undefined,
      aiMatchStatus: req.query.aiMatchStatus ? String(req.query.aiMatchStatus) : undefined,
      staleOnly: String(req.query.staleOnly ?? 'false') === 'true',
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsForJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    const result = await applicationService.getApplicationsForJob(
      req.user!.userId,
      req.params.jobId,
      {
        page,
        limit,
        sortBy: String(req.query.sortBy ?? 'newest'),
        recommendation: req.query.recommendation
          ? String(req.query.recommendation)
          : undefined,
        confidenceLevel: req.query.confidenceLevel
          ? String(req.query.confidenceLevel)
          : undefined,
        aiMatchStatus: req.query.aiMatchStatus
          ? String(req.query.aiMatchStatus)
          : undefined,
        staleOnly: String(req.query.staleOnly ?? 'false') === 'true',
      }
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const retryApplicationAiMatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await applicationService.retryAiMatch(req.user!.userId, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await applicationService.updateStatus(req.user!.userId, req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};