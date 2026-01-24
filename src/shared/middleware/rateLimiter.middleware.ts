import { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Global rate limit: 100 requests per 15 minutes per IP
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    res.status(429).set('Retry-After', '900').json({
      error: 'Too many requests from this IP, please try again later.',
    });
  },
});

// Stricter rate limit for auth endpoints: 5 requests per 15 minutes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message:
    'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).set('Retry-After', '900').json({
      error: 'Too many authentication attempts, please try again later.',
    });
  },
});

// Per-user rate limit: 1000 requests per hour per user
// Store implementation using memory store (can be replaced with Redis for production)
export const userRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per window
  message: 'Too many requests from this user, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Key generator uses userId from authenticated request
  keyGenerator: (req: Request) => {
    // Use userId from auth middleware if available, otherwise fall back to IP
    return (req as any).user?.userId || ipKeyGenerator(req.ip || '');
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).set('Retry-After', '3600').json({
      error: 'Too many requests from this user, please try again later.',
    });
  },
});
