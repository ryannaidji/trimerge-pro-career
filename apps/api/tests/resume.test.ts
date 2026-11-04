import { resumeService } from '../src/modules/resumes/resume.service';
import { UserModel } from '../src/modules/users/user.model';
import { CandidateProfileModel } from '../src/modules/candidates/candidate.model';
import { cloudinary } from '../src/lib/cloudinary';
import streamifier from 'streamifier';

jest.mock('../src/modules/users/user.model', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock('../src/modules/candidates/candidate.model', () => ({
  CandidateProfileModel: {
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../src/lib/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

jest.mock('streamifier', () => ({
  __esModule: true,
  default: {
    createReadStream: jest.fn(),
  },
}));

describe('Resume service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads a resume and upserts the candidate profile resumeUrl', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue({
      _id: 'user-id',
      accountType: 'TALENT',
    });

    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => ({
      end: () => callback(null, { secure_url: 'https://res.cloudinary.com/demo/resume.pdf', public_id: 'resume-1', format: 'pdf', bytes: 123 }),
    }));

    (streamifier.createReadStream as jest.Mock).mockReturnValue({
      pipe: (destination: { end: () => void }) => destination.end(),
    });

    (CandidateProfileModel.findOneAndUpdate as jest.Mock).mockResolvedValue({
      userId: 'user-id',
      resumeUrl: 'https://res.cloudinary.com/demo/resume.pdf',
    });

    const result = await resumeService.upload('user-id', {
      buffer: Buffer.from('resume content'),
      originalname: 'my resume.pdf',
      mimetype: 'application/pdf',
      size: 123,
    } as Express.Multer.File);

    expect(result.message).toBe('Resume uploaded successfully.');
    expect(CandidateProfileModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-id' },
      expect.objectContaining({
        $set: expect.objectContaining({
          resumeUrl: 'https://res.cloudinary.com/demo/resume.pdf',
          resumePublicId: 'resume-1',
        }),
      }),
      { new: true, upsert: true }
    );
  });
});