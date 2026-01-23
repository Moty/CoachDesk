import nodemailer, { Transporter } from 'nodemailer';
import { INotificationProvider } from '../interfaces/INotificationProvider.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.config.js';

interface QueueItem {
  to: string;
  subject: string;
  body: string;
  isHtml: boolean;
  retries: number;
  maxRetries: number;
}

export class SMTPProvider implements INotificationProvider {
  private transporter: Transporter;
  private queue: QueueItem[] = [];
  private processing = false;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });

    logger.info('SMTP Provider initialized', {
      host: config.smtpHost,
      port: config.smtpPort,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<void> {
    // Queue the email for asynchronous processing
    this.queue.push({
      to,
      subject,
      body,
      isHtml,
      retries: 0,
      maxRetries: 3,
    });

    logger.info('Email queued', { to, subject });

    // Start processing queue if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        await this.sendEmailInternal(item);
        // Remove from queue on success
        this.queue.shift();
        logger.info('Email sent successfully', {
          to: item.to,
          subject: item.subject,
        });
      } catch (error) {
        item.retries++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Email send failed', {
          to: item.to,
          subject: item.subject,
          retries: item.retries,
          maxRetries: item.maxRetries,
          error: errorMessage,
        });

        if (item.retries >= item.maxRetries) {
          // Remove from queue after max retries
          this.queue.shift();
          logger.error('Email send failed after max retries', {
            to: item.to,
            subject: item.subject,
            retries: item.retries,
          });
        } else {
          // Move to end of queue for retry with exponential backoff
          this.queue.shift();
          this.queue.push(item);

          // Wait before retrying (exponential backoff: 2^retries seconds)
          const delay = Math.pow(2, item.retries) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    this.processing = false;
  }

  private async sendEmailInternal(item: QueueItem): Promise<void> {
    const mailOptions = {
      from: config.smtpFrom,
      to: item.to,
      subject: item.subject,
      ...(item.isHtml ? { html: item.body } : { text: item.body }),
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Get current queue length (for monitoring/testing)
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}
