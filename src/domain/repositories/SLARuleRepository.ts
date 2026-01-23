import { Repository } from '../../shared/database/base/Repository.js';
import { IDatabaseAdapter } from '../../shared/database/interfaces/IDatabaseAdapter.js';
import { SLARule } from '../models/SLARule.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';

interface SLARuleDocument {
  id: string;
  organizationId: string;
  priority: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: Date | { _seconds: number; _nanoseconds: number };
}

/**
 * Repository for managing SLA Rule entities
 */
export class SLARuleRepository extends Repository<SLARule> {
  constructor(adapter: IDatabaseAdapter) {
    super(adapter, 'sla_rules');
  }

  /**
   * Transform database document to domain model
   */
  protected toDomain(doc: SLARuleDocument): SLARule {
    const convertTimestamp = (ts: Date | { _seconds: number; _nanoseconds: number }): Date => {
      if (ts instanceof Date) return ts;
      return new Date(ts._seconds * 1000);
    };

    return {
      id: doc.id,
      organizationId: doc.organizationId,
      priority: doc.priority,
      firstResponseMinutes: doc.firstResponseMinutes,
      resolutionMinutes: doc.resolutionMinutes,
      createdAt: convertTimestamp(doc.createdAt),
    };
  }

  /**
   * Transform domain model to database document
   */
  protected toDatabase(entity: Partial<SLARule>): Partial<SLARuleDocument> {
    const doc: Partial<SLARuleDocument> = {};

    if (entity.id !== undefined) doc.id = entity.id;
    if (entity.organizationId !== undefined) doc.organizationId = entity.organizationId;
    if (entity.priority !== undefined) doc.priority = entity.priority;
    if (entity.firstResponseMinutes !== undefined) doc.firstResponseMinutes = entity.firstResponseMinutes;
    if (entity.resolutionMinutes !== undefined) doc.resolutionMinutes = entity.resolutionMinutes;
    if (entity.createdAt !== undefined) doc.createdAt = entity.createdAt;

    return doc;
  }

  /**
   * Create a new SLA rule
   */
  async create(data: Partial<SLARule>): Promise<SLARule> {
    // Validate required fields
    if (!data.organizationId || !data.priority) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'organizationId and priority are required', 400);
    }

    if (data.firstResponseMinutes === undefined || data.resolutionMinutes === undefined) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'firstResponseMinutes and resolutionMinutes are required', 400);
    }

    if (data.firstResponseMinutes < 0 || data.resolutionMinutes < 0) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Minutes cannot be negative', 400);
    }

    // Set default timestamp if not provided
    const now = new Date();
    if (!data.createdAt) data.createdAt = now;

    return super.create(data);
  }

  /**
   * Find SLA rule by organization and priority
   */
  async findByOrganizationAndPriority(organizationId: string, priority: string): Promise<SLARule | null> {
    const results = await this.findAll({
      where: {
        organizationId,
        priority,
      },
      limit: 1,
    });

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update an existing SLA rule
   */
  async update(id: string, data: Partial<SLARule>): Promise<SLARule | null> {
    if (data.firstResponseMinutes !== undefined && data.firstResponseMinutes < 0) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'firstResponseMinutes cannot be negative', 400);
    }

    if (data.resolutionMinutes !== undefined && data.resolutionMinutes < 0) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'resolutionMinutes cannot be negative', 400);
    }

    return super.update(id, data);
  }

  /**
   * Get required indexes for this collection
   */
  getRequiredIndexes(): Array<{ field: string; order?: 'asc' | 'desc' }> {
    return [
      { field: 'organizationId' },
      { field: 'priority' },
    ];
  }
}
