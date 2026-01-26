import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { UserRole, isValidRole } from '../../domain/models/User.js';
import { config } from '../../shared/config/env.config.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { firestoreAdapter } from '../../shared/database/firestore.js';
import { isValidEmail } from '../../shared/utils/validation.js';

const userRepository = new UserRepository(firestoreAdapter);

interface CreateUserRequest {
  email: string;
  displayName: string;
  role: string;
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, displayName, role }: CreateUserRequest = req.body;

    // Require admin role
    if (req.user?.role !== UserRole.ADMIN) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Admin role required',
        403
      );
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Email is required',
        400,
        { field: 'email' }
      );
    }

    if (!isValidEmail(email)) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid email format',
        400,
        { field: 'email', value: email }
      );
    }

    // Validate displayName
    if (!displayName || typeof displayName !== 'string') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Display name is required',
        400,
        { field: 'displayName' }
      );
    }

    // Validate role enum
    if (!role || !isValidRole(role)) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Invalid role',
        400,
        { field: 'role', value: role, validRoles: Object.values(UserRole) }
      );
    }

    const organizationId = req.user.organizationId;

    // Validate email unique within organization
    const existingUser = await userRepository.findByEmail(email, organizationId);
    if (existingUser) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Email already exists in organization',
        409,
        { email, organizationId }
      );
    }

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await getAuth().createUser({
        email,
        displayName,
      });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/email-already-exists') {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Email already exists',
          409,
          { email }
        );
      }
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to create user in Firebase Auth',
        500,
        { error: err.message }
      );
    }

    // Set custom claims for role and organizationId
    await getAuth().setCustomUserClaims(firebaseUser.uid, {
      role,
      organizationId,
    });

    // Create user record in database
    const user = await userRepository.create({
      id: firebaseUser.uid,
      email,
      displayName,
      role: role as UserRole,
      organizationId,
    });

    // Return 201 with created user (exclude password)
    res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Require admin role
    if (req.user?.role !== UserRole.ADMIN) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Admin role required',
        403
      );
    }

    const organizationId = req.user.organizationId;
    const roleFilter = req.query.role as string | undefined;

    // Parse pagination params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    // Build query options
    const where: Record<string, unknown> = {};
    
    // Apply role filter if provided
    if (roleFilter) {
      if (!isValidRole(roleFilter)) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid role',
          400,
          { role: roleFilter, validRoles: Object.values(UserRole) }
        );
      }
      where.role = roleFilter;
    }

    // Fetch users with pagination
    const users = await userRepository.findByOrganization(organizationId, {
      where,
      limit,
      offset,
    });

    // Get total count
    const totalUsers = await userRepository.findByOrganization(organizationId, { where });
    const total = totalUsers.length;

    // Exclude sensitive fields
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.status(200).json({
      users: sanitizedUsers,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'User not authenticated',
        401
      );
    }

    const userId = req.user.userId;
    const email = req.user.email || '';
    const organizationId = req.user.organizationId || config.defaultOrganizationId;
    
    // First try to find by ID
    let user = await userRepository.findById(userId);

    // If not found by ID, try to find by email (handles legacy/mismatched IDs)
    if (!user && email) {
      user = await userRepository.findByEmail(email, organizationId);
      
      // If found by email but with different ID, update the ID to match Firebase UID
      if (user && user.id !== userId) {
        // User exists with different ID - return it as-is for now
        // In production you might want to migrate the ID
      }
    }

    // If still not found, create the user
    if (!user) {
      const role = isValidRole(req.user.role)
        ? (req.user.role as UserRole)
        : UserRole.CUSTOMER;

      user = await userRepository.create({
        id: userId,
        email,
        displayName: email,
        role,
        organizationId,
      });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}
