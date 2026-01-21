import { Repository } from '../../shared/database/base/Repository.js';
import { IDatabaseAdapter } from '../../shared/database/interfaces/IDatabaseAdapter.js';
import { QueryOptions } from '../../shared/database/interfaces/IRepository.js';
import { Comment } from '../models/Comment.js';

interface CommentDocument {
  id: string;
  ticketId: string;
  authorId: string;
  isPublic: boolean;
  body: string;
  attachments?: string[];
  createdAt: Date | { _seconds: number; _nanoseconds: number };
}

/**
 * Repository for managing Comment entities
 */
export class CommentRepository extends Repository<Comment> {
  constructor(adapter: IDatabaseAdapter) {
    super(adapter, 'comments');
  }

  /**
   * Transform database document to domain model
   */
  protected toDomain(doc: CommentDocument): Comment {
    const convertTimestamp = (ts: Date | { _seconds: number; _nanoseconds: number }): Date => {
      if (ts instanceof Date) return ts;
      return new Date(ts._seconds * 1000);
    };

    return {
      id: doc.id,
      ticketId: doc.ticketId,
      authorId: doc.authorId,
      isPublic: doc.isPublic,
      body: doc.body,
      attachments: doc.attachments,
      createdAt: convertTimestamp(doc.createdAt),
    };
  }

  /**
   * Transform domain model to database document
   */
  protected toDatabase(entity: Partial<Comment>): Partial<CommentDocument> {
    const doc: Partial<CommentDocument> = {};

    if (entity.id !== undefined) doc.id = entity.id;
    if (entity.ticketId !== undefined) doc.ticketId = entity.ticketId;
    if (entity.authorId !== undefined) doc.authorId = entity.authorId;
    if (entity.isPublic !== undefined) doc.isPublic = entity.isPublic;
    if (entity.body !== undefined) doc.body = entity.body;
    if (entity.attachments !== undefined) doc.attachments = entity.attachments;
    if (entity.createdAt !== undefined) doc.createdAt = entity.createdAt;

    return doc;
  }

  /**
   * Create a new comment
   */
  async create(data: Partial<Comment>): Promise<Comment> {
    if (!data.createdAt) data.createdAt = new Date();
    return super.create(data);
  }

  /**
   * Find all comments for a specific ticket
   */
  async findByTicket(ticketId: string, isPublicFilter?: boolean): Promise<Comment[]> {
    const options: QueryOptions = {
      where: {
        ticketId,
      },
      orderBy: [{ field: 'createdAt', direction: 'asc' }],
    };

    if (isPublicFilter !== undefined) {
      options.where!.isPublic = isPublicFilter;
    }

    return this.findAll(options);
  }

  /**
   * Get required indexes for optimized queries
   */
  getRequiredIndexes(): Array<{ field: string; order?: 'asc' | 'desc' }> {
    return [
      { field: 'ticketId' },
      { field: 'createdAt', order: 'asc' },
    ];
  }
}
