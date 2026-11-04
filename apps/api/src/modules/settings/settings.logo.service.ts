import path from 'path';
import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { EmployerProfileModel } from '../employers/employer.model';
import { storeFile, StoredFile } from '../../lib/storage';

function sanitizeOriginalName(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '');
}

export const settingsLogoService = {
  async uploadCompanyLogo(userId: string, file: Express.Multer.File) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'EMPLOYER') {
      throw new AppError('Forbidden', 403);
    }

    if (!file) {
      throw new AppError('Company logo file is required', 400);
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new AppError('Uploaded file is empty or invalid', 400);
    }

    const profile = await EmployerProfileModel.findOne({ userId });

    if (!profile) {
      throw new AppError('Employer profile not found', 404);
    }

    let uploadedFile: StoredFile;

    try {
      uploadedFile = await storeFile(file, 'company-logos');
    } catch {
      throw new AppError('Failed to upload company logo to cloud storage', 500);
    }

    profile.logoUrl = uploadedFile.secure_url;
    await profile.save();

    return {
      message: 'Company logo uploaded successfully.',
      logo: {
        originalName: sanitizeOriginalName(file.originalname),
        mimeType: file.mimetype,
        size: file.size,
        logoUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        extension: path.extname(file.originalname).toLowerCase(),
        format: uploadedFile.format,
      },
    };
  },
};