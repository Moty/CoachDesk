import { Request, Response, NextFunction } from 'express';
import { TicketRepository } from '../../domain/repositories/TicketRepository.js';
import { TicketPriority, TicketStatus } from '../../domain/models/Ticket.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { FirestoreAdapter } from '../../shared/database/adapters/firestore/FirestoreAdapter.js';

const firestoreAdapter = new FirestoreAdapter();
const ticketRepository = new TicketRepository(firestoreAdapter);

interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: string;
  tags?: string[];
}

export async function createTicket(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { subject, description, priority, tags }: CreateTicketRequest = req.body;

    // Validate subject
    if (!subject || typeof subject !== 'string') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Subject is required',
        400,
        { field: 'subject' }
      );
    }

    if (subject.length < 1 || subject.length > 200) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Subject must be between 1 and 200 characters',
        400,
        { field: 'subject', length: subject.length }
      );
    }

    // Validate description
    if (!description || typeof description !== 'string') {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Description is required',
        400,
        { field: 'description' }
      );
    }

    if (description.length < 1 || description.length > 5000) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Description must be between 1 and 5000 characters',
        400,
        { field: 'description', length: description.length }
      );
    }

    // Validate priority enum or default to 'medium'
    const validPriorities = Object.values(TicketPriority);
    let ticketPriority = TicketPriority.MEDIUM;
    
    if (priority) {
      if (!validPriorities.includes(priority as TicketPriority)) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
          400,
          { field: 'priority', value: priority }
        );
      }
      ticketPriority = priority as TicketPriority;
    }

    // Set requesterId from authenticated user
    const requesterId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    // Create ticket with status 'new'
    const ticket = await ticketRepository.create({
      organizationId,
      requesterId,
      status: TicketStatus.NEW,
      priority: ticketPriority,
      subject: subject.trim(),
      description: description.trim(),
      tags: tags || [],
      slaTimers: {
        breached: false,
      },
    });

    // Return 201 with created ticket
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}
