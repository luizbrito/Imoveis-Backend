import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Router } from '@better-upload/server';
import { handleRequest, route, RejectUpload } from '@better-upload/server';
import { aws, custom } from '@better-upload/server/clients';
import { randomUUID } from 'node:crypto';
import { env } from '../../env';
import { storage, hasStoragePermission, StorageConfig } from '../permissions';

// Supports AWS S3 and S3-compatible services (Minio, Cloudflare R2, Backblaze B2, etc.)
function createS3Client(): S3Client {
  return new S3Client({
    region: env.S3_REGION || 'us-east-1',
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: env.S3_SECRET_ACCESS_KEY || '',
    },
    // Required for Minio and some S3-compatible services
    forcePathStyle: env.S3_ENDPOINT ? true : false,
  });
}

function createUploadClient() {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    return null;
  }

  if (env.S3_ENDPOINT) {
    const url = new URL(env.S3_ENDPOINT);
    return custom({
      host: url.host,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      region: env.S3_REGION || 'us-east-1',
      secure: url.protocol === 'https:',
      forcePathStyle: true,
    });
  }
  return aws({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    region: env.S3_REGION || 'us-east-1',
  });
}

function constructPublicUrl(key: string): string {
  if (env.S3_ENDPOINT) {
    return `${env.S3_ENDPOINT}/${env.S3_BUCKET_PUBLIC}/${key}`;
  } else {
    return `https://${env.S3_BUCKET_PUBLIC}.s3.${env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }
}

async function generateSignedUrl(key: string, bucket: string): Promise<string> {
  const s3Client = createS3Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  // 1 hour expiry - balance between security and user convenience
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Dynamically generate upload routes from storage config
function generateUploadRoutes() {
  const routes: Record<string, any> = {};

  for (const [key, storageConfig] of Object.entries(storage) as [
    keyof typeof storage,
    StorageConfig,
  ][]) {
    // Enable multipart for files > 50MB to improve upload reliability
    const isLargeFile = storageConfig.maxSizeInBytes > 50_000_000;

    routes[key] = route({
      ...(storageConfig.fileTypes && { fileTypes: storageConfig.fileTypes }),
      maxFileSize: storageConfig.maxSizeInBytes,
      multipleFiles: true,
      ...(isLargeFile && { multipart: true }),

      onBeforeUpload: async ({ req }: any) => {
        const context = (req as any).context;

        if (
          !context?.currentUser ||
          !context?.currentMember ||
          !context?.currentOrganization
        ) {
          throw new RejectUpload('Authentication required');
        }

        if (!hasStoragePermission(storageConfig, context)) {
          throw new RejectUpload('Insufficient permissions');
        }

        const bucketName = storageConfig.publicRead
          ? env.S3_BUCKET_PUBLIC
          : env.S3_BUCKET_PRIVATE;

        return {
          bucketName,
          generateObjectInfo: ({ file }) => {
            const folderPath = storageConfig.folder.replace(
              ':organizationId',
              context.currentOrganization.id,
            );

            const fileName = file.name;
            const lastDotIndex = fileName.lastIndexOf('.');
            const extension =
              lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
            const nameWithoutExt =
              lastDotIndex !== -1
                ? fileName.substring(0, lastDotIndex)
                : fileName;

            // Key format: folder/randomId/originalFileName.ext
            // RandomId prevents overwrites and adds security through obscurity
            const randomId = randomUUID();
            const key = `${folderPath}/${randomId}/${nameWithoutExt}${extension}`;

            return {
              key,
              ...(storageConfig.publicRead && { acl: 'public-read' }),
            };
          },
        };
      },

      onAfterSignedUrl: async (data) => {
        const bucket = storageConfig.publicRead
          ? env.S3_BUCKET_PUBLIC
          : env.S3_BUCKET_PRIVATE;

        const fileMetadata = await Promise.all(
          data.files.map(async (file) => {
            return {
              name: file.name,
              size: file.size,
              type: file.type,
              key: file.objectInfo.key,
              ...(storageConfig.publicRead && {
                publicUrl: constructPublicUrl(file.objectInfo.key),
              }),
              ...(!storageConfig.publicRead && {
                signedUrl: await generateSignedUrl(
                  file.objectInfo.key,
                  bucket!,
                ),
              }),
            };
          }),
        );

        return {
          metadata: {
            ...data.metadata,
            files: fileMetadata,
          },
        };
      },
    });
  }

  return routes;
}

export const uploadRouter: Router = {
  // Null only when S3 is unconfigured, in which case uploads are inert anyway
  client: createUploadClient()!,
  bucketName: env.S3_BUCKET_PRIVATE || '',
  routes: generateUploadRoutes(),
};

export const handleUpload = (req: Request) => handleRequest(req, uploadRouter);
