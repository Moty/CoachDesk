import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { createValidationErrorLogContext } from '../utils/logContext.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Validation middleware warning logs include request metadata and validation details
        const validationContext = createValidationErrorLogContext(req, {
          errors: error.issues,
          input: req.body,
        });
        logger.warn('Request body validation failed', validationContext);

        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid request body',
          400,
          { validation: error.issues }
        );
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      // We can safely assign since we're overriding the query type
      (req as any).query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Validation middleware warning logs include request metadata and validation details
        const validationContext = createValidationErrorLogContext(req, {
          errors: error.issues,
          input: req.query,
        });
        logger.warn('Request query validation failed', validationContext);

        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid query parameters',
          400,
          { validation: error.issues }
        );
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      // We can safely assign since we're overriding the params type
      (req as any).params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Validation middleware warning logs include request metadata and validation details
        const validationContext = createValidationErrorLogContext(req, {
          errors: error.issues,
          input: req.params,
        });
        logger.warn('Request params validation failed', validationContext);

        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid path parameters',
          400,
          { validation: error.issues }
        );
      }
      next(error);
    }
  };
}