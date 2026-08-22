import { Hono } from 'hono';
import { appContext } from '../../shared/controller/appContext';
import { handleUpload } from './uploadRouter';

export const fileRoutes = new Hono();

/**
 * Better Upload handler for direct S3 uploads
 * Handles pre-signed URL generation and file uploads
 */
fileRoutes.post('/upload', async (c) => {
  // Attach context to request for authentication in uploadRouter
  const context = await appContext(c);
  const request = c.req.raw;
  (request as any).context = context;

  return handleUpload(request);
});
