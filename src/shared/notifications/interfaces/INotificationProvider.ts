/**
 * Email notification provider interface
 */
export interface INotificationProvider {
  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param body Email body (HTML or plain text)
   * @param isHtml Whether body is HTML (default: false)
   */
  sendEmail(
    to: string,
    subject: string,
    body: string,
    isHtml?: boolean
  ): Promise<void>;
}
