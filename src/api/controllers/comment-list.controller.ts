import { Request, Response, NextFunction } from 'express';
import { CommentRepository } from '../../domain/repositories/CommentRepository.js';
import { UserRepository } from '../../domain/repositories/UserRepository.js';
import { TicketRepository } from '../../domain/repositories/TicketRepository.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { firestoreAdapter } from '../../shared/database/firestore.js';
import { UserRole } from '../../domain/models/User.js';

const commentRepository = new CommentRepository(firestoreAdapter);
const userRepository = new UserRepository(firestoreAdapter);
const ticketRepository = new TicketRepository(firestoreAdapter);

export async function listComments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    // Parse pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (page < 1) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Page must be at least 1',
        400,
        { page }
      );
    }

    if (limit < 1 || limit > 100) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Limit must be between 1 and 100',
        400,
        { limit }
      );
    }

    // Fetch ticket to validate existence and access
    const ticket = await ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Ticket not found',
        404,
        { ticketId }
      );
    }

    // Validate ticket belongs to user's organization
    if (ticket.organizationId !== user.organizationId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied',
        403,
        { ticketId }
      );
    }

    // Customers can only access their own tickets
    if (user.role === UserRole.CUSTOMER && ticket.requesterId !== user.userId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied',
        403,
        { ticketId }
      );
    }

    // Fetch comments based on user role
    let comments;
    if (user.role === UserRole.CUSTOMER) {
      // Customers only see public comments
      comments = await commentRepository.findByTicket(ticketId, true);
    } else {
      // Agents/admins see all comments
      comments = await commentRepository.findByTicket(ticketId);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = comments.slice(startIndex, endIndex);

    // Fetch author details for all comments
    const authorIds = [...new Set(paginatedComments.map(c => c.authorId))];
    const authors = await Promise.all(
      authorIds.map(id => userRepository.findById(id))
    );
    
    const authorMap = new Map(
      authors.filter(a => a !== null).map(a => [a!.id, a!])
    );

    // Enrich comments with author details
    const enrichedComments = paginatedComments.map(comment => ({
      ...comment,
      author: authorMap.get(comment.authorId)
        ? {
            displayName: authorMap.get(comment.authorId)!.displayName,
            role: authorMap.get(comment.authorId)!.role,
          }
        : null,
    }));

    res.status(200).json({
      comments: enrichedComments,
      pagination: {
        page,
        limit,
        total: comments.length,
        totalPages: Math.ceil(comments.length / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
