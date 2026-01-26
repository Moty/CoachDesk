import { Request, Response, NextFunction } from 'express';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { createAuthSuccessLogContext, createAuthFailureLogContext } from '../utils/logContext.js';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    initializeApp({
      credential: cert(serviceAccountPath),
    });
  } else {
    initializeApp();
  }
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
    const decodedToken = await getAuth().verifyIdToken(token);

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

    // Log successful authentication with structured context
    const successContext = createAuthSuccessLogContext(req, userId, email, role);
    logger.info('User authentication successful', successContext);

    next();
  } catch (error) {
    if (error instanceof AppError) {
      // Log structured auth failure for AppError instances
      const failureContext = createAuthFailureLogContext(req, error.message);
      logger.warn('Authentication failed', failureContext);
      next(error);
    } else {
      // Log structured auth failure for unexpected errors
      const reason = error instanceof Error ? error.message : 'Unknown authentication error';
      const failureContext = createAuthFailureLogContext(req, reason);
      logger.warn('Authentication failed', failureContext);
      next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token', 401));
    }
  }
}
