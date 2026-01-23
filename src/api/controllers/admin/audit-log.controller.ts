import { Request, Response, NextFunction } from 'express';
import { AuditLogRepository } from '../../../domain/repositories/AuditLogRepository.js';
import { logger } from '../../../shared/utils/logger.js';
import { FirestoreAdapter } from '../../../shared/database/adapters/firestore/FirestoreAdapter.js';
import { QueryOptions } from '../../../shared/database/interfaces/IRepository.js';

const firestoreAdapter = new FirestoreAdapter();

export async function listAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizationId = req.user!.organizationId;
    const auditLogRepository = new AuditLogRepository(firestoreAdapter);

    // Build query options from request parameters
    const queryOptions: QueryOptions = {
      where: { organizationId },
      orderBy: [{ field: 'timestamp', direction: 'desc' }],
    };

    // Filter by ticketId
    if (req.query.ticketId) {
      queryOptions.where = {
        ...queryOptions.where,
        resourceType: 'ticket',
        resourceId: req.query.ticketId as string,
      };
    }

    // Filter by userId
    if (req.query.userId) {
      queryOptions.where = {
        ...queryOptions.where,
        userId: req.query.userId as string,
      };
    }

    // Filter by action
    if (req.query.action) {
      queryOptions.where = {
        ...queryOptions.where,
        action: req.query.action as string,
      };
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      const dateFilter: any = {};
      
      if (req.query.startDate) {
        dateFilter.gte = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        dateFilter.lte = new Date(req.query.endDate as string);
      }

      queryOptions.where = {
        ...queryOptions.where,
        timestamp: dateFilter,
      };
    }

    // Handle pagination
    if (req.query.page) {
      const page = parseInt(req.query.page as string, 10);
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;
      
      queryOptions.limit = pageSize;
      queryOptions.offset = (page - 1) * pageSize;
    } else if (req.query.limit) {
      queryOptions.limit = parseInt(req.query.limit as string, 10);
    }

    // Get audit logs
    const logs = await auditLogRepository.findAll(queryOptions);

    logger.info('Audit logs retrieved', {
      organizationId,
      count: logs.length,
      filters: {
        ticketId: req.query.ticketId,
        userId: req.query.userId,
        action: req.query.action,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      },
    });

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
}
