import { Repository } from '../../shared/database/base/Repository.js';
import { IDatabaseAdapter } from '../../shared/database/interfaces/IDatabaseAdapter.js';
import { QueryOptions } from '../../shared/database/interfaces/IRepository.js';
import { AuditLog } from '../models/AuditLog.js';

interface AuditLogDocument {
  id: string;
  timestamp: Date | { _seconds: number; _nanoseconds: number };
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  organizationId: string;
}

/**
 * Repository for managing AuditLog entities
 */
export class AuditLogRepository extends Repository<AuditLog> {
  constructor(adapter: IDatabaseAdapter) {
    super(adapter, 'audit_logs');
  }

  /**
   * Transform database document to domain model
   */
  protected toDomain(doc: AuditLogDocument): AuditLog {
    const convertTimestamp = (ts: Date | { _seconds: number; _nanoseconds: number }): Date => {
      if (ts instanceof Date) return ts;
      return new Date(ts._seconds * 1000);
    };

    return {
      id: doc.id,
      timestamp: convertTimestamp(doc.timestamp),
      userId: doc.userId,
      action: doc.action,
      resourceType: doc.resourceType,
      resourceId: doc.resourceId,
      changes: doc.changes,
      organizationId: doc.organizationId,
    };
  }

  /**
   * Transform domain model to database document
   */
  protected toDatabase(entity: Partial<AuditLog>): Partial<AuditLogDocument> {
    const doc: Partial<AuditLogDocument> = {};

    if (entity.id !== undefined) doc.id = entity.id;
    if (entity.timestamp !== undefined) doc.timestamp = entity.timestamp;
    if (entity.userId !== undefined) doc.userId = entity.userId;
    if (entity.action !== undefined) doc.action = entity.action;
    if (entity.resourceType !== undefined) doc.resourceType = entity.resourceType;
    if (entity.resourceId !== undefined) doc.resourceId = entity.resourceId;
    if (entity.changes !== undefined) doc.changes = entity.changes;
    if (entity.organizationId !== undefined) doc.organizationId = entity.organizationId;

    return doc;
  }

  /**
   * Create a new audit log entry
   */
  async create(data: Partial<AuditLog>): Promise<AuditLog> {
    if (!data.timestamp) {
      data.timestamp = new Date();
    }
    return super.create(data);
  }

  /**
   * Find all audit logs for a specific ticket
   */
  async findByTicket(ticketId: string, query?: QueryOptions): Promise<AuditLog[]> {
    const options: QueryOptions = {
      ...query,
      where: {
        ...query?.where,
        resourceType: 'ticket',
        resourceId: ticketId,
      },
    };

    return this.findAll(options);
  }

  /**
   * Find all audit logs for a specific user
   */
  async findByUser(userId: string, query?: QueryOptions): Promise<AuditLog[]> {
    const options: QueryOptions = {
      ...query,
      where: {
        ...query?.where,
        userId,
      },
    };

    return this.findAll(options);
  }

  /**
   * Find all audit logs within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date, query?: QueryOptions): Promise<AuditLog[]> {
    const options: QueryOptions = {
      ...query,
      where: {
        ...query?.where,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
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
      { field: 'organizationId' },
      { field: 'resourceId' },
      { field: 'timestamp', order: 'desc' },
    ];
  }
}
