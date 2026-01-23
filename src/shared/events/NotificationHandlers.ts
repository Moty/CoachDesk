import { eventBus } from './EventBus.js';
import { NotificationService } from '../notifications/NotificationService.js';
import { logger } from '../utils/logger.js';

export class NotificationHandlers {
  constructor(private notificationService: NotificationService) {}

  registerHandlers(): void {
    // Handle ticket.created event
    eventBus.on('ticket.created', async (data) => {
      try {
        logger.info('Sending ticket created notification', {
          ticketId: data.ticketId,
          requesterEmail: data.requesterEmail,
        });

        await this.notificationService.sendTicketCreatedEmail(
          data.requesterEmail,
          data.ticketId,
          data.subject,
          data.requesterName
        );

        logger.info('Ticket created notification sent', {
          ticketId: data.ticketId,
        });
      } catch (error) {
        logger.error('Failed to send ticket created notification', {
          ticketId: data.ticketId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Handle comment.added event - send email when agent replies (isPublic)
    eventBus.on('comment.added', async (data) => {
      try {
        // Only send notification for public comments
        if (!data.isPublic) {
          logger.debug('Skipping notification for private comment', {
            commentId: data.commentId,
          });
          return;
        }

        logger.info('Sending comment added notification', {
          ticketId: data.ticketId,
          commentId: data.commentId,
          requesterEmail: data.requesterEmail,
        });

        await this.notificationService.sendTicketRepliedEmail(
          data.requesterEmail,
          data.ticketId,
          data.ticketSubject,
          data.authorName,
          data.text
        );

        logger.info('Comment added notification sent', {
          ticketId: data.ticketId,
          commentId: data.commentId,
        });
      } catch (error) {
        logger.error('Failed to send comment added notification', {
          ticketId: data.ticketId,
          commentId: data.commentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Handle ticket.updated event - send email when status changes to 'resolved'
    eventBus.on('ticket.updated', async (data) => {
      try {
        // Only send notification when status changes to resolved
        if (data.newStatus !== 'resolved') {
          logger.debug('Skipping notification for non-resolved status change', {
            ticketId: data.ticketId,
            newStatus: data.newStatus,
          });
          return;
        }

        logger.info('Sending ticket resolved notification', {
          ticketId: data.ticketId,
          requesterEmail: data.requesterEmail,
        });

        await this.notificationService.sendTicketResolvedEmail(
          data.requesterEmail,
          data.ticketId,
          data.subject,
          data.newStatus
        );

        logger.info('Ticket resolved notification sent', {
          ticketId: data.ticketId,
        });
      } catch (error) {
        logger.error('Failed to send ticket resolved notification', {
          ticketId: data.ticketId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    logger.info('Notification handlers registered');
  }
}
