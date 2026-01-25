import { Request, Response } from 'express';
import { RequestLogContext, RequestCompletionLogContext, ErrorLogContext, ValidationErrorLogContext } from '../types/logging.types.js';

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

export function createErrorLogContext(
  req: Request,
  errorCode?: string,
  errorDetails?: unknown,
  stack?: string
): ErrorLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    errorCode,
    errorDetails,
    stack,
  };
}

export function createValidationErrorLogContext(
  req: Request,
  validationDetails: unknown
): ValidationErrorLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    validationDetails,
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