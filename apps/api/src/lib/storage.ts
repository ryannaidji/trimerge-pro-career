import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import streamifier from 'streamifier';
import { env } from '../config/env';
import { cloudinary } from './cloudinary';
import { AppError } from '../utils/app-error';

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
    // Resumes and cover letters are private (authenticated route, #59); logos are public
    secure_url:
      folder === 'company-logos'
        ? `${env.PUBLIC_API_URL.replace(/\/$/, '')}/uploads/${folder}/${name}`
        : `${env.PUBLIC_API_URL.replace(/\/$/, '')}/api/v1/files/${folder}/${name}`,
    public_id: `${folder}/${name}`,
    resource_type: folder === 'company-logos' ? 'image' : 'raw',
    bytes: file.buffer.length,
    format: extension.replace('.', ''),
    original_filename: file.originalname,
  };
}

const startsWith = (buf: Buffer, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

/**
 * Check the real file type from its first bytes ("magic numbers") instead of trusting
 * the extension or the MIME type sent by the browser, which are both user-controlled (#21).
 */
export function detectFileType(buf: Buffer): 'pdf' | 'docx' | 'doc' | 'png' | 'jpg' | 'webp' | null {
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46])) return 'pdf'; // %PDF
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) return 'docx'; // ZIP container (DOCX)
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'doc'; // OLE2 (DOC)
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'jpg';
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp';
  return null;
}

const ALLOWED_TYPES: Record<StorageFolder, string[]> = {
  resumes: ['pdf', 'docx', 'doc'],
  'cover-letters': ['pdf', 'docx', 'doc'],
  'company-logos': ['png', 'jpg', 'webp'],
};

/** Store an uploaded file with the configured driver (STORAGE_DRIVER). */
export async function storeFile(file: Express.Multer.File, folder: StorageFolder): Promise<StoredFile> {
  const type = detectFileType(file.buffer);
  if (!type || !ALLOWED_TYPES[folder].includes(type)) {
    throw new AppError('The file content does not match an allowed file type', 400);
  }

  if (env.STORAGE_DRIVER === 'cloudinary') {
    return uploadToCloudinary(file, folder, folder === 'company-logos' ? 'image' : 'raw');
  }
  return uploadToLocalDisk(file, folder);
}

/**
 * Delete a locally stored file from its URL (account deletion, #58). Unknown or remote URLs
 * (e.g. Cloudinary) are ignored; failures never block the deletion of the account itself.
 */
export async function deleteStoredFile(url?: string | null): Promise<void> {
  if (!url) return;
  const match = /\/(resumes|cover-letters|company-logos)\/([a-f0-9]{32}\.[a-z0-9]{1,5})$/.exec(url);
  if (!match) return;
  try {
    await fs.unlink(path.resolve(process.cwd(), env.UPLOADS_DIR, match[1], match[2]));
  } catch {
    /* already gone */
  }
}
