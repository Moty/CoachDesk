import { Request, Response, NextFunction } from 'express';
import { TicketRepository } from '../../domain/repositories/TicketRepository.js';
import { TicketPriority, TicketStatus } from '../../domain/models/Ticket.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { FirestoreAdapter } from '../../shared/database/adapters/firestore/FirestoreAdapter.js';
import { SLARuleRepository } from '../../domain/repositories/SLARuleRepository.js';
import { SLAService } from '../../domain/services/SLAService.js';
import { UserRole } from '../../domain/models/User.js';

const firestoreAdapter = new FirestoreAdapter();
const ticketRepository = new TicketRepository(firestoreAdapter);
const slaRuleRepository = new SLARuleRepository(firestoreAdapter);
const slaService = new SLAService(slaRuleRepository);

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

    // Calculate SLA timers
    const createdAt = new Date();
    const slaTimers = await slaService.calculateTimers(
      organizationId,
      ticketPriority,
      createdAt
    );

    // Create ticket with status 'new'
    const ticket = await ticketRepository.create({
      organizationId,
      requesterId,
      status: TicketStatus.NEW,
      priority: ticketPriority,
      subject: subject.trim(),
      description: description.trim(),
      tags: tags || [],
      createdAt,
      slaTimers,
    });

    // Return 201 with created ticket
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function getTicketById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const ticketId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Fetch the ticket
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

    // Customers can only view their own tickets
    if (user.role === UserRole.CUSTOMER && ticket.requesterId !== user.userId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied',
        403,
        { ticketId }
      );
    }

    // Agents/admins can view all organization tickets (already validated above)

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function listTickets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    // Build query based on user role
    const queryWhere: Record<string, any> = { organizationId: user.organizationId };

    // Customers can only see their own tickets
    if (user.role === UserRole.CUSTOMER) {
      queryWhere.requesterId = user.userId;
    }

    // Filter: status (comma-separated)
    if (req.query.status) {
      const statuses = (req.query.status as string).split(',').map(s => s.trim());
      queryWhere.status = { 'in': statuses };
    }

    // Filter: priority
    if (req.query.priority) {
      queryWhere.priority = req.query.priority as string;
    }

    // Filter: assigneeId
    if (req.query.assigneeId) {
      queryWhere.assigneeId = req.query.assigneeId as string;
    }

    // Filter: requesterId (agents/admins can filter by requester)
    if (req.query.requesterId && user.role !== UserRole.CUSTOMER) {
      queryWhere.requesterId = req.query.requesterId as string;
    }

    // Filter: tags (comma-separated, OR logic - match any tag)
    if (req.query.tags) {
      const tags = (req.query.tags as string).split(',').map(t => t.trim());
      queryWhere.tags = { 'array-contains-any': tags };
    }

    // Sorting: default to createdAt desc
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) || 'desc';
    
    const validSortFields = ['createdAt', 'updatedAt', 'priority'];
    const validOrders = ['asc', 'desc'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const finalOrder = validOrders.includes(order) ? order : 'desc';

    // Get total count and tickets
    const total = await ticketRepository.count({ where: queryWhere });
    const tickets = await ticketRepository.findAll({
      where: queryWhere,
      orderBy: [{ field: finalSortBy, direction: finalOrder as 'asc' | 'desc' }],
      limit,
      offset,
    });

    res.status(200).json({
      tickets,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
}
