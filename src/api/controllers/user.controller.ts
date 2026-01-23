import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { UserRole, isValidRole } from '../../domain/models/User.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { FirestoreAdapter } from '../../shared/database/adapters/firestore/FirestoreAdapter.js';
import { isValidEmail } from '../../shared/utils/validation.js';

const firestoreAdapter = new FirestoreAdapter();
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
      firebaseUser = await admin.auth().createUser({
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
    await admin.auth().setCustomUserClaims(firebaseUser.uid, {
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
