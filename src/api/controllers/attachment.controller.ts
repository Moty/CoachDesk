import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { TicketRepository } from '../../domain/repositories/TicketRepository.js';
import { CommentRepository } from '../../domain/repositories/CommentRepository.js';
import { FirestoreAdapter } from '../../shared/database/adapters/firestore/FirestoreAdapter.js';
import { FirebaseStorageAdapter } from '../../shared/storage/adapters/FirebaseStorageAdapter.js';
import { AppError, ErrorCode } from '../../shared/errors/AppError.js';
import { UserRole } from '../../domain/models/User.js';
import { logger } from '../../shared/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const firestoreAdapter = new FirestoreAdapter();
const ticketRepository = new TicketRepository(firestoreAdapter);
const commentRepository = new CommentRepository(firestoreAdapter);
const storageAdapter = new FirebaseStorageAdapter();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadMiddleware = upload.single('file');

export async function uploadAttachment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticketId = req.params.id as string;
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;
    const userRole = req.user!.role;

    // Validate file exists
    if (!req.file) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'No file uploaded',
        400
      );
    }

    // Validate ticket exists
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'Ticket not found',
        404,
        { ticketId }
      );
    }

    // Validate ticket belongs to user's organization
    if (ticket.organizationId !== organizationId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied: ticket belongs to different organization',
        403
      );
    }

    // Validate user has access to ticket
    if (userRole === UserRole.CUSTOMER && ticket.requesterId !== userId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'Access denied: customers can only upload to their own tickets',
        403
      );
    }

    // Upload file to storage
    const uploadResult = await storageAdapter.upload({
      organizationId,
      ticketId,
      file: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    // Get signed URL for the uploaded file
    const url = await storageAdapter.getSignedUrl(uploadResult.filePath);

    // Create attachment metadata
    const attachment = {
      id: uuidv4(),
      fileName: uploadResult.fileName,
      filePath: uploadResult.filePath,
      size: uploadResult.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    // Create a comment with the attachment
    const comment = await commentRepository.create({
      ticketId,
      authorId: userId,
      isPublic: true,
      body: `Uploaded attachment: ${req.file.originalname}`,
      attachments: [attachment],
      createdAt: new Date(),
    });

    logger.info('Attachment uploaded', {
      ticketId,
      attachmentId: attachment.id,
      fileName: attachment.fileName,
      size: attachment.size,
    });

    res.status(201).json({
      id: attachment.id,
      fileName: attachment.fileName,
      url,
      size: attachment.size,
      mimeType: attachment.mimeType,
      uploadedAt: attachment.uploadedAt,
    });
  } catch (error) {
    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError(
            ErrorCode.VALIDATION_ERROR,
            'File size exceeds maximum allowed size of 10MB',
            400
          )
        );
      }
    }
    next(error);
  }
}
