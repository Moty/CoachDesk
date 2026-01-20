import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.error(err.message, { context: { code: err.code, details: err.details } });
    const response: { code: ErrorCode; message: string; details?: unknown } = {
      code: err.code,
      message: err.message,
    };
    if (err.details) {
      response.details = err.details;
    }
    res.status(err.statusCode).json(response);
  } else {
    logger.error(err.message, { context: { stack: err.stack } });
    res.status(500).json({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    });
  }
}
