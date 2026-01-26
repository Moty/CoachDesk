import { Request, Response, NextFunction } from 'express';
import { SLARuleRepository } from '../../../domain/repositories/SLARuleRepository.js';
import { TicketPriority } from '../../../domain/models/Ticket.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import { logger } from '../../../shared/utils/logger.js';
import { firestoreAdapter } from '../../../shared/database/firestore.js';

export async function createSLARule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { priority, firstResponseMinutes, resolutionMinutes } = req.body;
    const organizationId = req.user!.organizationId;

  // Validate priority enum
  const validPriorities = Object.values(TicketPriority);
  if (!validPriorities.includes(priority)) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      400
    );
  }

  // Validate time values are positive integers
  if (
    !Number.isInteger(firstResponseMinutes) ||
    firstResponseMinutes <= 0
  ) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      'firstResponseMinutes must be a positive integer',
      400
    );
  }

  if (
    !Number.isInteger(resolutionMinutes) ||
    resolutionMinutes <= 0
  ) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      'resolutionMinutes must be a positive integer',
      400
    );
  }

  const slaRuleRepository = new SLARuleRepository(firestoreAdapter);

  // Check if rule already exists for this organization and priority
  const existingRule = await slaRuleRepository.findByOrganizationAndPriority(
    organizationId,
    priority
  );

  let slaRule;

  if (existingRule) {
    // Update existing rule
    slaRule = await slaRuleRepository.update(existingRule.id, {
      firstResponseMinutes,
      resolutionMinutes,
    });

    logger.info('SLA rule updated', {
      organizationId,
      priority,
      slaRuleId: existingRule.id,
    });
  } else {
    // Create new rule
    slaRule = await slaRuleRepository.create({
      organizationId,
      priority,
      firstResponseMinutes,
      resolutionMinutes,
      createdAt: new Date(),
    });

    logger.info('SLA rule created', {
      organizationId,
      priority,
      slaRuleId: slaRule.id,
    });
  }

  res.status(201).json(slaRule);
  } catch (error) {
    next(error);
  }
}

export async function listSLARules(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const organizationId = req.user!.organizationId;
    const slaRuleRepository = new SLARuleRepository(firestoreAdapter);

    // Get all rules for organization
    const rules = await slaRuleRepository.findAll({
      where: { organizationId },
    });

    // Define priority order for sorting
    const priorityOrder: { [key: string]: number } = {
      [TicketPriority.LOW]: 1,
      [TicketPriority.MEDIUM]: 2,
      [TicketPriority.HIGH]: 3,
      [TicketPriority.URGENT]: 4,
    };

    // Sort rules by priority
    const sortedRules = rules.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    logger.info('SLA rules listed', {
      organizationId,
      count: sortedRules.length,
    });

    res.status(200).json(sortedRules);
  } catch (error) {
    next(error);
  }
}

