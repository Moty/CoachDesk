import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { UserRole } from '../../domain/models/User.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { FirestoreAdapter } from '../../shared/database/adapters/firestore/FirestoreAdapter.js';
import { isValidEmail } from '../../shared/utils/validation.js';
import { config } from '../../shared/config/env.config.js';

const firestoreAdapter = new FirestoreAdapter();
const userRepository = new UserRepository(firestoreAdapter);

interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password, displayName }: RegisterRequest = req.body;

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

    // Validate password
    if (!password || typeof password !== 'string') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Password is required',
        400,
        { field: 'password' }
      );
    }

    if (password.length < 8) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Password must be at least 8 characters',
        400,
        { field: 'password' }
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

    const organizationId = config.defaultOrganizationId;
    const role = UserRole.CUSTOMER;

    // Create user in Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email,
        password,
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
      role,
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
