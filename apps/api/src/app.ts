import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { AppError } from './utils/app-error';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { allowedOrigins } from './config/env';
import { swaggerSpec } from './config/swagger';
import rootRouter from './routes';

class CorsError extends Error {
  constructor() {
    super('CORS not allowed');
  }
}

const app = express();

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
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
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

  // Upload errors from multer (file too large, unexpected field...)
  if (err?.name === 'MulterError') {
    res.status(400).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
