import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1, 'JWT_ACCESS_EXPIRES_IN is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1, 'JWT_REFRESH_EXPIRES_IN is required'),

  OTP_EXPIRES_MINUTES: z.string().min(1, 'OTP_EXPIRES_MINUTES is required'),
  BCRYPT_ROUNDS: z.string().min(1, 'BCRYPT_ROUNDS is required'),

  CORS_ORIGIN: z
    .string()
    .min(1, 'CORS_ORIGIN is required')
    .transform((val) => val.split(',').map((origin) => origin.trim())),

  // Public base URL of this API, used to build links to locally stored files
  PUBLIC_API_URL: z.string().default('http://localhost:4000'),

  // Email: "console" logs emails (local development, no account needed), "mailgun" sends them
  MAIL_DRIVER: z.enum(['console', 'mailgun']).default('console'),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_SENDER: z.string().optional(),

  // File storage: "local" writes to ./uploads (no account needed), "cloudinary" uploads to Cloudinary
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
  UPLOADS_DIR: z.string().default('uploads'),
  CLOUDINARY_URL: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  AI_MATCHING_ENABLED: z
    .string()
    .default('true')
    .transform((value) => value === 'true'),
});

const _env = envSchema
  .superRefine((val, ctx) => {
    if (val.MAIL_DRIVER === 'mailgun') {
      for (const key of ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_SENDER'] as const) {
        if (!val[key]) ctx.addIssue({ code: 'custom', path: [key], message: `${key} is required when MAIL_DRIVER=mailgun` });
      }
    }
    // CORS must be an explicit allowlist; in production only HTTPS origins (#23)
    for (const origin of val.CORS_ORIGIN) {
      if (origin === '*' || (val.NODE_ENV === 'production' && !origin.startsWith('https://'))) {
        ctx.addIssue({ code: 'custom', path: ['CORS_ORIGIN'], message: `Invalid CORS origin "${origin}"` });
      }
    }
    if (val.STORAGE_DRIVER === 'cloudinary' && !val.CLOUDINARY_URL) {
      ctx.addIssue({ code: 'custom', path: ['CLOUDINARY_URL'], message: 'CLOUDINARY_URL is required when STORAGE_DRIVER=cloudinary' });
    }
  })
  .safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables. Check your .env file.');
}

export const env = _env.data;
export const allowedOrigins = _env.data.CORS_ORIGIN;