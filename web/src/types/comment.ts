export interface Attachment {
  id: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  isPublic: boolean;
  body: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}
