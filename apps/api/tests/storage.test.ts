import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { env } from '../src/config/env';
import { storeFile } from '../src/lib/storage';

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
      { buffer: Buffer.from('hello'), originalname: '../../evil name.PDF' } as Express.Multer.File,
      'resumes'
    );

    expect(result.secure_url).toMatch(/^http:\/\/localhost:4000\/uploads\/resumes\/[a-f0-9]{32}\.pdf$/);
    expect(result.bytes).toBe(5);
    const stored = await fs.readFile(path.join(dir, result.public_id), 'utf8');
    expect(stored).toBe('hello');
  });
});
