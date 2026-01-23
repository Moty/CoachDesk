import { Request, Response, NextFunction } from 'express';
import { CommentRepository } from '../../domain/repositories/CommentRepository.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { FirestoreAdapter } from '../../shared/database/adapters/firestore/FirestoreAdapter.js';
import { TicketRepository } from '../../domain/repositories/TicketRepository.js';
import { UserRole } from '../../domain/models/User.js';

const firestoreAdapter = new FirestoreAdapter();
const commentRepository = new CommentRepository(firestoreAdapter);
const ticketRepository = new TicketRepository(firestoreAdapter);

interface AddCommentRequest {
  body: string;
  isPublic?: boolean;
}

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { body, isPublic }: AddCommentRequest = req.body;

    // Validate body
    if (!body || typeof body !== 'string') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Body is required',
        400,
        { field: 'body' }
      );
    }

    if (body.length < 1 || body.length > 10000) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Body must be between 1 and 10000 characters',
        400,
        { field: 'body', length: body.length }
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

    // Customers can only comment on their own tickets
    if (user.role === UserRole.CUSTOMER && ticket.requesterId !== user.userId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied',
        403,
        { ticketId }
      );
    }

    // Determine isPublic value
    let commentIsPublic: boolean;
    
    if (user.role === UserRole.CUSTOMER) {
      // Customers always create public comments
      commentIsPublic = true;
    } else {
      // Agents can explicitly set isPublic
      if (isPublic !== undefined) {
        commentIsPublic = isPublic;
      } else {
        // Default to false for agents
        commentIsPublic = false;
      }
    }

    // Create the comment
    const comment = await commentRepository.create({
      ticketId,
      authorId: user.userId,
      body: body.trim(),
      isPublic: commentIsPublic,
    });

    // Update ticket firstResponseAt if this is agent's first public response
    if (user.role !== UserRole.CUSTOMER && commentIsPublic && ticket.slaTimers && !ticket.slaTimers.firstResponseAt) {
      const updates = {
        slaTimers: {
          ...ticket.slaTimers,
          firstResponseAt: new Date(),
        },
      };
      await ticketRepository.update(ticketId, updates);
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}
