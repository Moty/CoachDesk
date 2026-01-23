import cron from 'node-cron';
import { logger } from '../shared/utils/logger.js';
import { SLAService } from '../domain/services/SLAService.js';
import { TicketRepository } from '../domain/repositories/TicketRepository.js';
import { SLARuleRepository } from '../domain/repositories/SLARuleRepository.js';
import { IDatabaseAdapter } from '../shared/database/interfaces/IDatabaseAdapter.js';
import { TicketStatus } from '../domain/models/Ticket.js';

export class SLAMonitoringJob {
  private task: cron.ScheduledTask | null = null;
  private slaService: SLAService;
  private ticketRepository: TicketRepository;

  constructor(private dbAdapter: IDatabaseAdapter) {
    this.ticketRepository = new TicketRepository(dbAdapter);
    const slaRuleRepository = new SLARuleRepository(dbAdapter);
    this.slaService = new SLAService(slaRuleRepository);
  }

  /**
   * Start the SLA monitoring job - runs every 5 minutes
   */
  start(): void {
    // Run every 5 minutes: */5 * * * *
    this.task = cron.schedule('*/5 * * * *', async () => {
      await this.execute();
    });

    logger.info('SLA monitoring job started - runs every 5 minutes');
  }

  /**
   * Stop the SLA monitoring job
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      logger.info('SLA monitoring job stopped');
    }
  }

  /**
   * Execute the SLA monitoring check
   */
  async execute(): Promise<void> {
    const startTime = Date.now();
    logger.info('SLA monitoring job started');

    try {
      // Query tickets with status in (new, open, pending)
      const statuses = [TicketStatus.NEW, TicketStatus.OPEN, TicketStatus.PENDING];
      const allTickets = [];

      // Fetch tickets for each status
      for (const status of statuses) {
        const ticketsForStatus = await this.ticketRepository.findAll({
          where: { status },
        });
        allTickets.push(...ticketsForStatus);
      }

      const tickets = allTickets;
      logger.info(`Found ${tickets.length} tickets to check for SLA breaches`);

      let breachedCount = 0;
      let updatedCount = 0;
      const errors: Array<{ ticketId: string; error: string }> = [];

      // Check SLA timers for each ticket
      for (const ticket of tickets) {
        try {
          if (!ticket.slaTimers) {
            logger.warn(`Ticket ${ticket.id} has no SLA timers, skipping`);
            continue;
          }

          // Check if SLA is breached
          const updatedTimers = this.slaService.checkBreach(ticket.slaTimers);

          // Update breached flag if it changed
          if (updatedTimers.breached !== ticket.slaTimers.breached) {
            await this.ticketRepository.update(ticket.id, {
              slaTimers: updatedTimers,
            });

            if (updatedTimers.breached) {
              breachedCount++;
              logger.warn(`Ticket ${ticket.id} SLA breached`, {
                ticketId: ticket.id,
                organizationId: ticket.organizationId,
                subject: ticket.subject,
              });
            }
            updatedCount++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ ticketId: ticket.id, error: errorMessage });
          logger.error(`Error checking SLA for ticket ${ticket.id}`, {
            error: errorMessage,
            ticketId: ticket.id,
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.info('SLA monitoring job completed', {
        duration: `${duration}ms`,
        totalTickets: tickets.length,
        breachedCount,
        updatedCount,
        errorCount: errors.length,
      });

      // Log errors summary if any
      if (errors.length > 0) {
        logger.error('SLA monitoring job completed with errors', {
          errorCount: errors.length,
          errors: errors.slice(0, 10), // Log first 10 errors
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('SLA monitoring job failed', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - let the job retry next cycle
    }
  }
}
