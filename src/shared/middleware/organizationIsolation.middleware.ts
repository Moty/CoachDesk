import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { UserRole } from '../../domain/models/User.js';

/**
 * Organization Isolation middleware factory
 * Enforces multi-tenant data isolation by validating organizationId in request
 * matches the authenticated user's organization
 * 
 * @returns Express middleware function
 * @throws AppError with 403 status if organizationId mismatch detected
 * 
 * @example
 * app.get('/tickets/:id', authMiddleware, organizationIsolation(), handler);
 */
export function organizationIsolation() {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new AppError(
          ErrorCode.UNAUTHORIZED,
          'Authentication required',
          401
        );
      }

      // Admin users can override organization isolation
      if (req.user.role === UserRole.ADMIN) {
        logger.debug('Organization isolation bypassed for admin user', {
          userId: req.user.userId,
          role: req.user.role,
        });
        next();
        return;
      }

      // Extract organizationId from various sources
      const requestOrgId = 
        req.body?.organizationId || 
        req.query?.organizationId || 
        req.params?.organizationId;

      // If no organizationId in request, allow (will be set to user's org later)
      if (!requestOrgId) {
        next();
        return;
      }

      // Validate organizationId matches authenticated user's organization
      if (requestOrgId !== req.user.organizationId) {
        logger.warn('Organization isolation violation detected', {
          userId: req.user.userId,
          userOrganizationId: req.user.organizationId,
          requestedOrganizationId: requestOrgId,
        });

        throw new AppError(
          ErrorCode.FORBIDDEN,
          'Access denied: organization mismatch',
          403,
          { 
            userOrganizationId: req.user.organizationId,
            requestedOrganizationId: requestOrgId,
          }
        );
      }

      logger.debug('Organization isolation check passed', {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
