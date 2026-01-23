import { INotificationProvider } from './interfaces/INotificationProvider.js';
import { emailTemplates } from './templates.js';

export class NotificationService {
  constructor(private provider: INotificationProvider) {}

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<void> {
    return this.provider.sendEmail(to, subject, body, isHtml);
  }

  async sendTicketCreatedEmail(
    to: string,
    ticketId: string,
    ticketTitle: string,
    requesterName: string
  ): Promise<void> {
    const template = emailTemplates.ticketCreated({
      ticketId,
      ticketTitle,
      requesterName,
    });
    return this.sendEmail(to, template.subject, template.body, template.isHtml);
  }

  async sendTicketRepliedEmail(
    to: string,
    ticketId: string,
    ticketTitle: string,
    commentAuthor: string,
    commentText: string
  ): Promise<void> {
    const template = emailTemplates.ticketReplied({
      ticketId,
      ticketTitle,
      commentAuthor,
      commentText,
    });
    return this.sendEmail(to, template.subject, template.body, template.isHtml);
  }

  async sendTicketResolvedEmail(
    to: string,
    ticketId: string,
    ticketTitle: string,
    status: string
  ): Promise<void> {
    const template = emailTemplates.ticketResolved({
      ticketId,
      ticketTitle,
      status,
    });
    return this.sendEmail(to, template.subject, template.body, template.isHtml);
  }
}
