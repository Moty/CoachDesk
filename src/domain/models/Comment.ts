/**
 * Comment model for ticket conversations
 */

export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  isPublic: boolean;
  body: string;
  attachments?: Attachment[];
  createdAt: Date;
}
