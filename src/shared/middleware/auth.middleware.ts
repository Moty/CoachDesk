import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing authorization header', 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid authorization format', 401);
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Missing token', 401);
    }

    // Verify the Firebase JWT token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Extract user claims
    const userId = decodedToken.uid;
    const email = decodedToken.email || '';
    const role = (decodedToken.role as string) || 'user';
    const organizationId = (decodedToken.organizationId as string) || '';

    // Attach user context to request
    req.user = {
      userId,
      email,
      role,
      organizationId,
    };

    logger.debug('User authenticated', { userId, email, role });
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.warn('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token', 401));
    }
  }
}
