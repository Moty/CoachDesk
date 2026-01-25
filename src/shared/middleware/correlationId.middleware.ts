import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface to include correlation ID
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing X-Request-Id header or generate a new UUID
  const correlationId = req.get('X-Request-Id') || uuidv4();

  // Store correlation ID on the request object
  req.correlationId = correlationId;

  // Return correlation ID in response header
  res.set('X-Request-Id', correlationId);

  next();
}