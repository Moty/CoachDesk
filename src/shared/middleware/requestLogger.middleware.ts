import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { createRequestLogContext, createRequestCompletionLogContext, getLogLevelForStatusCode } from '../utils/logContext.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Log request start with shared context
  const requestContext = createRequestLogContext(req);
  logger.info('Incoming request', requestContext);

  // Capture response
  res.on('finish', () => {
    const completionContext = createRequestCompletionLogContext(req, res, startTime);
    const logLevel = getLogLevelForStatusCode(res.statusCode);

    logger.log(logLevel, 'Request completed', completionContext);
  });

  next();
}
