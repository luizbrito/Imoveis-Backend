import { z } from 'zod';

/**
 * File upload schema matching the backend metadata response
 *
 * @property key - S3 object key (path in bucket)
 * @property name - Original filename
 * @property publicUrl - Public URL (only present for public files with publicRead: true)
 * @property signedUrl - Signed URL with expiration (only present for private files)
 * @property size - File size in bytes
 * @property type - MIME type
 */
export const fileUploadedSchema = z.object({
  key: z.string(),
  name: z.string(),
  publicUrl: z.string().optional(),
  signedUrl: z.string().optional(),
  size: z.number().optional(),
  type: z.string().optional(),
});

export interface FileUploaded extends z.output<typeof fileUploadedSchema> {}
