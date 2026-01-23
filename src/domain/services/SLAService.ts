import { SLARuleRepository } from '../repositories/SLARuleRepository.js';
import { SLATimer, TicketPriority } from '../models/Ticket.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';

export class SLAService {
  constructor(private slaRuleRepository: SLARuleRepository) {}

  /**
   * Calculate SLA timers for a ticket based on organization and priority
   */
  async calculateTimers(
    organizationId: string,
    priority: TicketPriority,
    createdAt: Date
  ): Promise<SLATimer> {
    // Load SLA rule for organization and priority
    const slaRule = await this.slaRuleRepository.findByOrganizationAndPriority(
      organizationId,
      priority
    );

    if (!slaRule) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `No SLA rule found for organization ${organizationId} and priority ${priority}`,
        404
      );
    }

    // Calculate firstResponseDue
    const firstResponseDue = new Date(
      createdAt.getTime() + slaRule.firstResponseMinutes * 60 * 1000
    );

    // Calculate resolutionDue
    const resolutionDue = new Date(
      createdAt.getTime() + slaRule.resolutionMinutes * 60 * 1000
    );

    return {
      firstResponseDue,
      resolutionDue,
      breached: false,
    };
  }

  /**
   * Check if SLA timers have been breached
   */
  checkBreach(slaTimers: SLATimer): SLATimer {
    const now = new Date();
    let breached = false;

    // Check first response breach
    if (slaTimers.firstResponseDue && !slaTimers.firstResponseAt) {
      if (now > slaTimers.firstResponseDue) {
        breached = true;
      }
    }

    // Check resolution breach
    if (slaTimers.resolutionDue && !slaTimers.resolvedAt) {
      if (now > slaTimers.resolutionDue) {
        breached = true;
      }
    }

    return {
      ...slaTimers,
      breached,
    };
  }
}
