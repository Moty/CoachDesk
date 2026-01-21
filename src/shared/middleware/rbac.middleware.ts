import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { UserRole } from '../../domain/models/User.js';

/**
 * Role-Based Access Control (RBAC) middleware factory
 * Checks if the authenticated user has one of the required roles
 * 
 * @param roles - One or more roles that are allowed to access the route (OR logic)
 * @returns Express middleware function
 * @throws AppError with 403 status if user lacks required permissions
 * 
 * @example
 * app.get('/admin', authMiddleware, requireRole(UserRole.ADMIN), handler);
 * app.post('/tickets', authMiddleware, requireRole(UserRole.AGENT, UserRole.ADMIN), handler);
 */
export function requireRole(...roles: UserRole[]) {
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

      // Check if user has one of the required roles
      const userRole = req.user.role;
      const hasRequiredRole = roles.includes(userRole as UserRole);

      if (!hasRequiredRole) {
        logger.warn('Authorization failed: insufficient permissions', {
          userId: req.user.userId,
          userRole,
          requiredRoles: roles,
        });

        throw new AppError(
          ErrorCode.FORBIDDEN,
          'Insufficient permissions',
          403,
          { requiredRoles: roles, userRole }
        );
      }

      logger.debug('Authorization successful', {
        userId: req.user.userId,
        userRole,
        requiredRoles: roles,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
