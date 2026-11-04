import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

if (env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
    url: env.CLOUDINARY_URL,
  });
}

export { cloudinary };
