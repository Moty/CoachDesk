import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { register } from '../../../src/api/controllers/auth.controller.js';
import { AppError, ErrorCode } from '../../../src/shared/errors/AppError.js';

// Mock firebase-admin
vi.mock('firebase-admin', () => {
  const mockAuth = {
    createUser: vi.fn(async ({ email, password, displayName }) => ({
      uid: 'test-user-id',
      email,
      displayName,
    })),
    setCustomUserClaims: vi.fn(async () => {}),
  };

  return {
    default: {
      auth: () => mockAuth,
    },
    auth: () => mockAuth,
  };
});

// Mock UserRepository
vi.mock('../../../src/domain/repositories/UserRepository.js', () => {
  class MockUserRepository {
    async create(user: any) {
      return {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }
  return {
    UserRepository: MockUserRepository,
  };
});

// Mock FirestoreAdapter
vi.mock('../../../src/shared/database/adapters/firestore/FirestoreAdapter.js', () => ({
  FirestoreAdapter: vi.fn(),
}));

// Mock validation
vi.mock('../../../src/shared/utils/validation.js', () => ({
  isValidEmail: vi.fn((email: string) => email.includes('@')),
}));

// Mock config
vi.mock('../../../src/shared/config/env.config.js', () => ({
  config: {
    defaultOrganizationId: 'org-123',
  },
}));

describe('Auth Controller - register', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'customer',
        organizationId: 'org-123',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject missing email', async () => {
    req.body = {
      password: 'password123',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Email is required',
      })
    );
  });

  it('should reject invalid email format', async () => {
    req.body = {
      email: 'invalid-email',
      password: 'password123',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid email format',
      })
    );
  });

  it('should reject missing password', async () => {
    req.body = {
      email: 'test@example.com',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password is required',
      })
    );
  });

  it('should reject password shorter than 8 characters', async () => {
    req.body = {
      email: 'test@example.com',
      password: 'short',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password must be at least 8 characters',
      })
    );
  });

  it('should reject missing displayName', async () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    await register(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Display name is required',
      })
    );
  });

  it('should set role to customer for self-registration', async () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'customer',
      })
    );
  });

  it('should not include password in response', async () => {
    req.body = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
    };

    await register(req as Request, res as Response, next);

    const responseData = (res.json as any).mock.calls[0][0];
    expect(responseData).not.toHaveProperty('password');
  });
});
