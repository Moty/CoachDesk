import { v4 as uuidv4 } from 'uuid';
import { AppError, ErrorCode } from '../errors/AppError.js';

// Supported file types
export const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  // Archives
  'application/zip': ['.zip'],
};

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file type against allowed MIME types
 */
export function validateFileType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.hasOwnProperty(mimeType)) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `File type not allowed. Supported types: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
      400,
      { mimeType }
    );
  }
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      400,
      { size, maxSize: MAX_FILE_SIZE }
    );
  }
}

/**
 * Generate unique file name with UUID and extension
 */
export function generateFileName(originalName: string, mimeType: string): string {
  // Get extension from mime type
  const extensions = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];
  const extension = extensions ? extensions[0] : '';

  // Generate UUID and append extension
  const uuid = uuidv4();
  return `${uuid}${extension}`;
}

/**
 * Build storage path: uploads/{organizationId}/{ticketId}/{filename}
 */
export function buildStoragePath(
  organizationId: string,
  ticketId: string,
  fileName: string
): string {
  return `uploads/${organizationId}/${ticketId}/${fileName}`;
}
