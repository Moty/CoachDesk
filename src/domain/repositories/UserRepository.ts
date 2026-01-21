import { Repository } from '../../shared/database/base/Repository.js';
import { IDatabaseAdapter } from '../../shared/database/interfaces/IDatabaseAdapter.js';
import { QueryOptions } from '../../shared/database/interfaces/IRepository.js';
import { User, UserRole, isValidRole } from '../models/User.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';

interface UserDocument {
  id: string;
  role: string;
  organizationId: string;
  email: string;
  displayName: string;
  createdAt: Date | { _seconds: number; _nanoseconds: number };
  updatedAt: Date | { _seconds: number; _nanoseconds: number };
}

/**
 * Repository for managing User entities
 */
export class UserRepository extends Repository<User> {
  constructor(adapter: IDatabaseAdapter) {
    super(adapter, 'users');
  }

  /**
   * Transform database document to domain model
   */
  protected toDomain(doc: UserDocument): User {
    const convertTimestamp = (ts: Date | { _seconds: number; _nanoseconds: number }): Date => {
      if (ts instanceof Date) return ts;
      return new Date(ts._seconds * 1000);
    };

    return {
      id: doc.id,
      role: doc.role as UserRole,
      organizationId: doc.organizationId,
      email: doc.email,
      displayName: doc.displayName,
      createdAt: convertTimestamp(doc.createdAt),
      updatedAt: convertTimestamp(doc.updatedAt),
    };
  }

  /**
   * Transform domain model to database document
   */
  protected toDatabase(entity: Partial<User>): Partial<UserDocument> {
    const doc: Partial<UserDocument> = {};

    if (entity.id !== undefined) doc.id = entity.id;
    if (entity.role !== undefined) {
      if (!isValidRole(entity.role)) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid user role', 400, {
          role: entity.role,
          validRoles: Object.values(UserRole),
        });
      }
      doc.role = entity.role;
    }
    if (entity.organizationId !== undefined) doc.organizationId = entity.organizationId;
    if (entity.email !== undefined) doc.email = entity.email;
    if (entity.displayName !== undefined) doc.displayName = entity.displayName;
    if (entity.createdAt !== undefined) doc.createdAt = entity.createdAt;
    if (entity.updatedAt !== undefined) doc.updatedAt = entity.updatedAt;

    return doc;
  }

  /**
   * Create a new user
   */
  async create(data: Partial<User>): Promise<User> {
    // Validate role
    if (data.role && !isValidRole(data.role)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid user role', 400, {
        role: data.role,
        validRoles: Object.values(UserRole),
      });
    }

    // Validate required fields
    if (!data.organizationId || !data.email) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Missing required fields', 400, {
        required: ['organizationId', 'email'],
      });
    }

    // Check for unique email within organization
    const existing = await this.findByEmail(data.email, data.organizationId);
    if (existing) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email already exists in organization', 400, {
        email: data.email,
        organizationId: data.organizationId,
      });
    }

    // Set default timestamps if not provided
    const now = new Date();
    if (!data.createdAt) data.createdAt = now;
    if (!data.updatedAt) data.updatedAt = now;

    return super.create(data);
  }

  /**
   * Update a user
   */
  async update(id: string, data: Partial<User>): Promise<User | null> {
    // If email is being updated, check uniqueness
    if (data.email) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404, { id });
      }

      // Check if email is already used by another user in the organization
      const emailUser = await this.findByEmail(data.email, existing.organizationId);
      if (emailUser && emailUser.id !== id) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Email already exists in organization', 400, {
          email: data.email,
          organizationId: existing.organizationId,
        });
      }
    }

    // Update timestamp
    data.updatedAt = new Date();

    return super.update(id, data);
  }

  /**
   * Find a user by email within an organization
   */
  async findByEmail(email: string, organizationId: string): Promise<User | null> {
    const options: QueryOptions = {
      where: {
        email,
        organizationId,
      },
    };

    return this.findOne(options);
  }

  /**
   * Find all users for a specific organization
   */
  async findByOrganization(organizationId: string, query?: QueryOptions): Promise<User[]> {
    const options: QueryOptions = {
      ...query,
      where: {
        ...query?.where,
        organizationId,
      },
    };

    return this.findAll(options);
  }

  /**
   * Create indexes for optimized queries
   * Note: In Firestore, indexes should be created via console or CLI
   * This method documents the required indexes
   */
  getRequiredIndexes(): Array<{ field: string; order?: 'asc' | 'desc' }> {
    return [
      { field: 'email' },
      { field: 'organizationId' },
    ];
  }
}
