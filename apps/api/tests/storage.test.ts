import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { env } from '../src/config/env';
import { storeFile, detectFileType } from '../src/lib/storage';

describe('Local storage driver', () => {
  let dir: string;

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'trimerge-uploads-'));
    env.STORAGE_DRIVER = 'local';
    env.UPLOADS_DIR = dir;
    env.PUBLIC_API_URL = 'http://localhost:4000';
  });

  afterAll(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('writes the file under a random name and returns a public URL', async () => {
    const result = await storeFile(
      { buffer: Buffer.from('%PDF-hello'), originalname: '../../evil name.PDF' } as Express.Multer.File,
      'resumes'
    );

    expect(result.secure_url).toMatch(/^http:\/\/localhost:4000\/uploads\/resumes\/[a-f0-9]{32}\.pdf$/);
    expect(result.bytes).toBe(10);
    const stored = await fs.readFile(path.join(dir, result.public_id), 'utf8');
    expect(stored).toBe('%PDF-hello');
  });

  it('rejects a file whose content does not match its extension', async () => {
    await expect(
      storeFile({ buffer: Buffer.from('<script>alert(1)</script>'), originalname: 'cv.pdf' } as Express.Multer.File, 'resumes')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a PDF uploaded as a company logo', async () => {
    await expect(
      storeFile({ buffer: Buffer.from('%PDF-1.7'), originalname: 'logo.png' } as Express.Multer.File, 'company-logos')
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('detects common file signatures', () => {
    expect(detectFileType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('png');
    expect(detectFileType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
    expect(detectFileType(Buffer.from([0x50, 0x4b, 0x03, 0x04]))).toBe('docx');
    expect(detectFileType(Buffer.from('RIFF0000WEBP', 'latin1'))).toBe('webp');
  });
});
