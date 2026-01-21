import { Repository } from '../../shared/database/base/Repository.js';
import { IDatabaseAdapter } from '../../shared/database/interfaces/IDatabaseAdapter.js';
import { QueryOptions } from '../../shared/database/interfaces/IRepository.js';
import { Ticket, TicketStatus, TicketPriority, SLATimer, isValidStatusTransition, isValidPriority } from '../models/Ticket.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';

interface TicketDocument {
  id: string;
  organizationId: string;
  requesterId: string;
  assigneeId?: string;
  status: string;
  priority: string;
  subject: string;
  description: string;
  tags: string[];
  createdAt: Date | { _seconds: number; _nanoseconds: number };
  updatedAt: Date | { _seconds: number; _nanoseconds: number };
  slaTimers?: {
    firstResponseAt?: Date | { _seconds: number; _nanoseconds: number };
    firstResponseDue?: Date | { _seconds: number; _nanoseconds: number };
    resolvedAt?: Date | { _seconds: number; _nanoseconds: number };
    resolutionDue?: Date | { _seconds: number; _nanoseconds: number };
    breached: boolean;
  };
}

/**
 * Repository for managing Ticket entities
 */
export class TicketRepository extends Repository<Ticket> {
  constructor(adapter: IDatabaseAdapter) {
    super(adapter, 'tickets');
  }

  /**
   * Transform database document to domain model
   */
  protected toDomain(doc: TicketDocument): Ticket {
    const convertTimestamp = (ts: Date | { _seconds: number; _nanoseconds: number } | undefined): Date | undefined => {
      if (!ts) return undefined;
      if (ts instanceof Date) return ts;
      return new Date(ts._seconds * 1000);
    };

    const slaTimers: SLATimer | undefined = doc.slaTimers
      ? {
          firstResponseAt: convertTimestamp(doc.slaTimers.firstResponseAt),
          firstResponseDue: convertTimestamp(doc.slaTimers.firstResponseDue),
          resolvedAt: convertTimestamp(doc.slaTimers.resolvedAt),
          resolutionDue: convertTimestamp(doc.slaTimers.resolutionDue),
          breached: doc.slaTimers.breached,
        }
      : undefined;

    return {
      id: doc.id,
      organizationId: doc.organizationId,
      requesterId: doc.requesterId,
      assigneeId: doc.assigneeId,
      status: doc.status as TicketStatus,
      priority: doc.priority as TicketPriority,
      subject: doc.subject,
      description: doc.description,
      tags: doc.tags,
      createdAt: convertTimestamp(doc.createdAt)!,
      updatedAt: convertTimestamp(doc.updatedAt)!,
      slaTimers,
    };
  }

  /**
   * Transform domain model to database document
   */
  protected toDatabase(entity: Partial<Ticket>): Partial<TicketDocument> {
    const doc: Partial<TicketDocument> = {};

    if (entity.id !== undefined) doc.id = entity.id;
    if (entity.organizationId !== undefined) doc.organizationId = entity.organizationId;
    if (entity.requesterId !== undefined) doc.requesterId = entity.requesterId;
    if (entity.assigneeId !== undefined) doc.assigneeId = entity.assigneeId;
    if (entity.status !== undefined) doc.status = entity.status;
    if (entity.priority !== undefined) {
      if (!isValidPriority(entity.priority)) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid ticket priority', 400, {
          priority: entity.priority,
          validPriorities: Object.values(TicketPriority),
        });
      }
      doc.priority = entity.priority;
    }
    if (entity.subject !== undefined) doc.subject = entity.subject;
    if (entity.description !== undefined) doc.description = entity.description;
    if (entity.tags !== undefined) doc.tags = entity.tags;
    if (entity.createdAt !== undefined) doc.createdAt = entity.createdAt;
    if (entity.updatedAt !== undefined) doc.updatedAt = entity.updatedAt;
    if (entity.slaTimers !== undefined) doc.slaTimers = entity.slaTimers;

    return doc;
  }

  /**
   * Create a new ticket
   */
  async create(data: Partial<Ticket>): Promise<Ticket> {
    // Validate priority
    if (data.priority && !isValidPriority(data.priority)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid ticket priority', 400, {
        priority: data.priority,
        validPriorities: Object.values(TicketPriority),
      });
    }

    // Set default timestamps if not provided
    const now = new Date();
    if (!data.createdAt) data.createdAt = now;
    if (!data.updatedAt) data.updatedAt = now;

    // Set default status if not provided
    if (!data.status) data.status = TicketStatus.NEW;

    return super.create(data);
  }

  /**
   * Update a ticket with status transition validation
   */
  async update(id: string, data: Partial<Ticket>): Promise<Ticket | null> {
    // If status is being updated, validate the transition
    if (data.status) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new AppError(ErrorCode.NOT_FOUND, 'Ticket not found', 404, { id });
      }

      if (!isValidStatusTransition(existing.status, data.status)) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid status transition', 400, {
          from: existing.status,
          to: data.status,
        });
      }
    }

    // Update timestamp
    data.updatedAt = new Date();

    return super.update(id, data);
  }

  /**
   * Find all tickets for a specific organization
   */
  async findByOrganization(organizationId: string, query?: QueryOptions): Promise<Ticket[]> {
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
      { field: 'organizationId' },
      { field: 'status' },
      { field: 'createdAt', order: 'desc' },
    ];
  }
}
