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

export interface LogContextHelper {
  createRequestContext(req: any): RequestLogContext;
  createCompletionContext(req: any, res: any, startTime: number): RequestCompletionLogContext;
}