export interface UploadOptions {
  organizationId: string;
  ticketId: string;
  file: Buffer;
  originalName: string;
  mimeType: string;
}

export interface UploadResult {
  fileName: string;
  filePath: string;
  url?: string;
  size: number;
}

export interface IStorageProvider {
  /**
   * Upload a file to storage
   * @param options Upload options including file data and metadata
   * @returns Upload result with file path and optional URL
   */
  upload(options: UploadOptions): Promise<UploadResult>;

  /**
   * Download a file from storage
   * @param path File path in storage
   * @returns File buffer
   */
  download(path: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   * @param path File path in storage
   */
  delete(path: string): Promise<void>;

  /**
   * Get a signed URL for accessing a file
   * @param path File path in storage
   * @param expiresInMinutes URL expiration time in minutes (default: 60)
   * @returns Signed URL for temporary access
   */
  getSignedUrl(path: string, expiresInMinutes?: number): Promise<string>;
}
