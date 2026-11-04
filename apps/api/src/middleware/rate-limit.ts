import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { env } from '../config/env';

const skip = () => env.NODE_ENV === 'test';

/**
 * Sensitive auth endpoints (login, register, OTP, password reset) (#20).
 * The web app proxies requests through its server, so many users can share one IP;
 * the key therefore combines the IP with the target email address.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  keyGenerator: (req: Request) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return `${req.ip ?? ''}:${email}`;
  },
  message: { message: 'Too many attempts. Please wait 15 minutes and try again.' },
});

/** Coarse limit for the whole API to absorb floods and scraping. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip,
  message: { message: 'Too many requests. Please slow down.' },
});
