import { Request, Response } from 'express';
import { RequestLogContext, RequestCompletionLogContext } from '../types/logging.types.js';

export function createRequestLogContext(req: Request): RequestLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
  };
}

export function createRequestCompletionLogContext(
  req: Request,
  res: Response,
  startTime: number
): RequestCompletionLogContext {
  const duration = Date.now() - startTime;
  const responseSize = res.get('content-length') ? parseInt(res.get('content-length') || '0', 10) : undefined;

  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    responseSize,
  };
}

export function getLogLevelForStatusCode(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) {
    return 'error';
  } else if (statusCode >= 400) {
    return 'warn';
  } else {
    return 'info';
  }
}