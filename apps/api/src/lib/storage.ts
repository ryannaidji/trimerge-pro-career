import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import streamifier from 'streamifier';
import { env } from '../config/env';
import { cloudinary } from './cloudinary';

export type StoredFile = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  bytes: number;
  format: string;
  original_filename?: string;
};

export type StorageFolder = 'resumes' | 'cover-letters' | 'company-logos';

function uploadToCloudinary(
  file: Express.Multer.File,
  folder: StorageFolder,
  resourceType: 'raw' | 'image'
): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `trimerge/${folder}`,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result as StoredFile);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

/**
 * Local disk storage. Files get a random, unguessable name (128-bit) so URLs
 * cannot be enumerated; the original name is never used on disk.
 */
async function uploadToLocalDisk(file: Express.Multer.File, folder: StorageFolder): Promise<StoredFile> {
  const extension = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const name = `${crypto.randomBytes(16).toString('hex')}${extension}`;
  const dir = path.resolve(process.cwd(), env.UPLOADS_DIR, folder);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), file.buffer);

  return {
    secure_url: `${env.PUBLIC_API_URL.replace(/\/$/, '')}/uploads/${folder}/${name}`,
    public_id: `${folder}/${name}`,
    resource_type: folder === 'company-logos' ? 'image' : 'raw',
    bytes: file.buffer.length,
    format: extension.replace('.', ''),
    original_filename: file.originalname,
  };
}

/** Store an uploaded file with the configured driver (STORAGE_DRIVER). */
export function storeFile(file: Express.Multer.File, folder: StorageFolder): Promise<StoredFile> {
  if (env.STORAGE_DRIVER === 'cloudinary') {
    return uploadToCloudinary(file, folder, folder === 'company-logos' ? 'image' : 'raw');
  }
  return uploadToLocalDisk(file, folder);
}
