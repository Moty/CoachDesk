export interface EmailTemplate {
  subject: string;
  body: string;
  isHtml: boolean;
}

interface TemplateData {
  ticketId?: string;
  ticketTitle?: string;
  requesterName?: string;
  assigneeName?: string;
  status?: string;
  commentAuthor?: string;
  commentText?: string;
}

export const emailTemplates = {
  ticketCreated: (data: TemplateData): EmailTemplate => ({
    subject: `New Ticket Created: ${data.ticketTitle}`,
    body: `
      <h2>New Support Ticket</h2>
      <p>A new ticket has been created:</p>
      <ul>
        <li><strong>Ticket ID:</strong> ${data.ticketId}</li>
        <li><strong>Title:</strong> ${data.ticketTitle}</li>
        <li><strong>Requester:</strong> ${data.requesterName}</li>
      </ul>
      <p>Please review and respond as soon as possible.</p>
    `,
    isHtml: true,
  }),

  ticketReplied: (data: TemplateData): EmailTemplate => ({
    subject: `New Reply on Ticket: ${data.ticketTitle}`,
    body: `
      <h2>New Reply on Your Ticket</h2>
      <p><strong>Ticket:</strong> ${data.ticketTitle} (${data.ticketId})</p>
      <p><strong>From:</strong> ${data.commentAuthor}</p>
      <blockquote>${data.commentText}</blockquote>
      <p>Log in to view the full conversation.</p>
    `,
    isHtml: true,
  }),

  ticketResolved: (data: TemplateData): EmailTemplate => ({
    subject: `Ticket Resolved: ${data.ticketTitle}`,
    body: `
      <h2>Ticket Resolved</h2>
      <p>Your support ticket has been resolved:</p>
      <ul>
        <li><strong>Ticket ID:</strong> ${data.ticketId}</li>
        <li><strong>Title:</strong> ${data.ticketTitle}</li>
        <li><strong>Status:</strong> ${data.status}</li>
      </ul>
      <p>If you have any further questions, please let us know.</p>
    `,
    isHtml: true,
  }),
};
