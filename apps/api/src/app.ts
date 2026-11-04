import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { AppError } from './utils/app-error';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, allowedOrigins } from './config/env';
import { swaggerSpec } from './config/swagger';
import rootRouter from './routes';
import { apiLimiter } from './middleware/rate-limit';

class CorsError extends Error {
  constructor() {
    super('CORS not allowed');
  }
}

const app = express();

// Behind one reverse proxy (Docker/Render/Netlify): use X-Forwarded-For for req.ip
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new CorsError());
    }
  },
  credentials: true
}));
app.use(apiLimiter);
app.use(express.json({ limit: '1mb' }));
// Locally stored uploads (#21): never executed or sniffed; documents are downloaded, not rendered
// Only company logos are public; resumes and cover letters go through /api/v1/files (#59)
app.use(
  '/uploads/company-logos',
  express.static(path.resolve(process.cwd(), env.UPLOADS_DIR, 'company-logos'), {
    dotfiles: 'deny',
    index: false,
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      if (!/\.(png|jpe?g|webp)$/i.test(filePath)) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    },
  })
);
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Main API routes
app.use(rootRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Centralized error handler.
// Stack traces are logged server side only and never sent to the client (#45).
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) console.error(err);
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof CorsError) {
    res.status(403).json({ message: 'Origin not allowed' });
    return;
  }

  // Malformed JSON body or body too large (from express.json)
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ message: 'Request body too large' });
    return;
  }

  // Invalid MongoDB ObjectId in a URL parameter (e.g. /jobs/not-an-id)
  if (err?.name === 'CastError') {
    res.status(400).json({ message: 'Invalid identifier' });
    return;
  }

  // Upload errors from multer (file too large, unexpected field...)
  if (err?.name === 'MulterError') {
    res.status(400).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
