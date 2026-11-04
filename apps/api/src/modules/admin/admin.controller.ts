import { Request, Response, NextFunction } from 'express';
import { deleteUserFiles } from '../account/account.routes';
import { adminService } from './admin.service';

export const listAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = {
      ...req.query,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
    };

    const result = await adminService.listUsers(query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.updateUserStatus(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Remove the user's uploaded files too (resumes, cover letters, logo), as the privacy policy states
    await deleteUserFiles(req.params.id);
    const result = await adminService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const listAdminJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = {
      ...req.query,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
    };

    const result = await adminService.listJobs(query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAdminJobStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.updateJobStatus(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};