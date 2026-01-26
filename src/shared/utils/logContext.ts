import { Request, Response } from 'express';
import {
  RequestLogContext,
  RequestCompletionLogContext,
  ErrorLogContext,
  ValidationErrorLogContext,
  AuthSuccessLogContext,
  AuthFailureLogContext,
  RbacFailureLogContext,
  RbacSuccessLogContext,
  FirestoreLogContext
} from '../types/logging.types.js';

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

export function createAuthSuccessLogContext(
  req: Request,
  userId: string,
  email: string,
  role: string
): AuthSuccessLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    userId,
    email,
    role,
  };
}

export function createAuthFailureLogContext(
  req: Request,
  reason: string
): AuthFailureLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    reason,
  };
}

export function createRbacFailureLogContext(
  req: Request,
  userId: string,
  userRole: string,
  requiredRoles: string[]
): RbacFailureLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    userId,
    userRole,
    requiredRoles,
  };
}

export function createRbacSuccessLogContext(
  req: Request,
  userId: string,
  userRole: string,
  requiredRoles: string[]
): RbacSuccessLogContext {
  return {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
    userId,
    userRole,
    requiredRoles,
  };
}

export function createFirestoreLogContext(
  operation: string,
  outcome: 'success' | 'failure',
  error?: string,
  details?: unknown
): FirestoreLogContext {
  return {
    operation,
    outcome,
    error,
    details,
  };
}