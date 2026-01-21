/**
 * Comment model for ticket conversations
 */

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  isPublic: boolean;
  body: string;
  attachments?: string[];
  createdAt: Date;
}
