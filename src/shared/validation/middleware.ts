import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export function validate(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation failed', {
          source,
          errors,
          data: req[source],
        });

        return next(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'Validation failed',
            400,
            { errors }
          )
        );
      }
      next(error);
    }
  };
}
