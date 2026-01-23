import { Storage } from '@google-cloud/storage';
import {
  IStorageProvider,
  UploadOptions,
  UploadResult,
} from '../interfaces/IStorageProvider.js';
import {
  validateFileType,
  validateFileSize,
  generateFileName,
  buildStoragePath,
} from '../utils.js';
import { logger } from '../../utils/logger.js';
import { AppError, ErrorCode } from '../../errors/AppError.js';

export class FirebaseStorageAdapter implements IStorageProvider {
  private storage: Storage;
  private bucketName: string;

  constructor(bucketName?: string) {
    this.storage = new Storage();
    this.bucketName = bucketName || process.env.FIREBASE_STORAGE_BUCKET || '';

    if (!this.bucketName) {
      throw new Error('Firebase Storage bucket name not configured');
    }

    logger.info('Firebase Storage adapter initialized', {
      bucketName: this.bucketName,
    });
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    const { organizationId, ticketId, file, originalName, mimeType } = options;

    // Validate file type
    validateFileType(mimeType);

    // Validate file size
    validateFileSize(file.length);

    // Generate unique file name
    const fileName = generateFileName(originalName, mimeType);

    // Build storage path
    const filePath = buildStoragePath(organizationId, ticketId, fileName);

    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileRef = bucket.file(filePath);

      // Upload file
      await fileRef.save(file, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName,
            organizationId,
            ticketId,
          },
        },
      });

      logger.info('File uploaded to Firebase Storage', {
        filePath,
        fileName,
        size: file.length,
        mimeType,
      });

      return {
        fileName,
        filePath,
        size: file.length,
      };
    } catch (error) {
      logger.error('Failed to upload file to Firebase Storage', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to upload file',
        500,
        { filePath }
      );
    }
  }

  async download(path: string): Promise<Buffer> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileRef = bucket.file(path);

      const [buffer] = await fileRef.download();

      logger.info('File downloaded from Firebase Storage', {
        path,
        size: buffer.length,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to download file from Firebase Storage', {
        path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(
        ErrorCode.NOT_FOUND,
        'File not found',
        404,
        { path }
      );
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileRef = bucket.file(path);

      await fileRef.delete();

      logger.info('File deleted from Firebase Storage', { path });
    } catch (error) {
      logger.error('Failed to delete file from Firebase Storage', {
        path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to delete file',
        500,
        { path }
      );
    }
  }

  async getSignedUrl(
    path: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileRef = bucket.file(path);

      // Generate signed URL with expiration
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });

      logger.info('Signed URL generated', {
        path,
        expiresInMinutes,
      });

      return url;
    } catch (error) {
      logger.error('Failed to generate signed URL', {
        path,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Failed to generate download URL',
        500,
        { path }
      );
    }
  }
}
