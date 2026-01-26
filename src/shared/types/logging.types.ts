export interface RequestLogContext {
  method: string;
  path: string;
  ip: string | undefined;
  userAgent?: string;
  correlationId: string;
}

export interface RequestCompletionLogContext extends RequestLogContext {
  statusCode: number;
  duration: string;
  responseSize?: number;
}

export interface ErrorLogContext extends RequestLogContext {
  errorCode?: string;
  errorDetails?: unknown;
  stack?: string;
}

export interface ValidationErrorLogContext extends RequestLogContext {
  validationDetails: unknown;
}

export interface AuthSuccessLogContext extends RequestLogContext {
  userId: string;
  email: string;
  role: string;
}

export interface AuthFailureLogContext extends RequestLogContext {
  reason: string;
}

export interface RbacFailureLogContext extends RequestLogContext {
  userId: string;
  userRole: string;
  requiredRoles: string[];
}

export interface RbacSuccessLogContext extends RequestLogContext {
  userId: string;
  userRole: string;
  requiredRoles: string[];
}

export interface FirestoreLogContext {
  operation: string;
  outcome: 'success' | 'failure';
  error?: string;
  details?: unknown;
}

export interface LogContextHelper {
  createRequestContext(req: any): RequestLogContext;
  createCompletionContext(req: any, res: any, startTime: number): RequestCompletionLogContext;
  createErrorContext(req: any, errorCode?: string, errorDetails?: unknown, stack?: string): ErrorLogContext;
  createValidationErrorContext(req: any, validationDetails: unknown): ValidationErrorLogContext;
}