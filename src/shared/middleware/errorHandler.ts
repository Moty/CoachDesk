import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { createErrorLogContext } from '../utils/logContext.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    // AppError logs include error code, details, and request metadata when available
    const errorContext = createErrorLogContext(req, err.code, err.details);
    logger.error(`AppError: ${err.message}`, errorContext);

    const response: { code: ErrorCode; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    };
    if (err.details) {
      response.details = err.details;
    }
    res.status(err.statusCode).json(response);
  } else {
    // Unknown errors log stack traces with request metadata when available
    const errorContext = createErrorLogContext(req, undefined, undefined, err.stack);
    logger.error(`Unknown error: ${err.message}`, errorContext);

    res.status(500).json({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    });
  }
}
