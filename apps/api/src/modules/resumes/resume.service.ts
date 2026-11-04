import path from 'path';
import { AppError } from '../../utils/app-error';
import { UserModel } from '../users/user.model';
import { CandidateProfileModel } from '../candidates/candidate.model';
import { storeFile, StoredFile } from '../../lib/storage';
import { extractResumeText } from './resume-parser.service';

function sanitizeOriginalName(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '');
}

export const resumeService = {
  async upload(userId: string, file: Express.Multer.File) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.accountType !== 'TALENT') {
      throw new AppError('Forbidden', 403);
    }

    if (!file) {
      throw new AppError('Resume file is required', 400);
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new AppError('Uploaded file is empty or invalid', 400);
    }

    const originalName = sanitizeOriginalName(file.originalname);
    const extension = path.extname(file.originalname).toLowerCase();

    let uploadedFile: StoredFile;

    try {
      uploadedFile = await storeFile(file, 'resumes');
    } catch (_error) {
      throw new AppError('Failed to upload resume to cloud storage', 500);
    }

    let resumeText = '';
    let resumeParsingStatus: 'SUCCESS' | 'FAILED' = 'FAILED';
    let resumeParsingError: string | undefined;

    try {
      resumeText = await extractResumeText(file);
      resumeParsingStatus = 'SUCCESS';
    } catch (error) {
      resumeParsingStatus = 'FAILED';

      if (error instanceof Error) {
        resumeParsingError = error.message;
      } else {
        resumeParsingError = 'Resume text extraction failed';
      }
    }

    const profile = await CandidateProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          resumeUrl: uploadedFile.secure_url,
          resumePublicId: uploadedFile.public_id,
          resumeOriginalName: originalName,
          resumeMimeType: file.mimetype,
          resumeSize: file.size,
          resumeExtension: extension,
          resumeUploadedAt: new Date(),

          resumeText: resumeParsingStatus === 'SUCCESS' ? resumeText : undefined,
          resumeTextExtractedAt: resumeParsingStatus === 'SUCCESS' ? new Date() : undefined,
          resumeParsingStatus,
          resumeParsingError: resumeParsingStatus === 'FAILED' ? resumeParsingError : undefined,
        },
        $unset:
          resumeParsingStatus === 'SUCCESS'
            ? {
                resumeParsingError: '',
              }
            : {},
      },
      { new: true, upsert: true }
    );

    return {
      message: 'Resume uploaded successfully.',
      resume: {
        originalName,
        mimeType: file.mimetype,
        size: file.size,
        resumeUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        extension,
        format: uploadedFile.format,
        parsingStatus: resumeParsingStatus,
        textLength: resumeParsingStatus === 'SUCCESS' ? resumeText.length : 0,
        parsingError: resumeParsingStatus === 'FAILED' ? resumeParsingError : undefined,
      },
    };
  },
};
