import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../env';

function getS3Client(): S3Client {
  return new S3Client({
    region: env.S3_REGION || 'us-east-1',
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: env.S3_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: env.S3_ENDPOINT ? true : false,
  });
}

async function generateDownloadUrl(key: string): Promise<string> {
  const s3Client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET_PRIVATE,
    Key: key,
  });

  // Generate signed URL valid for 1 hour
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Download URLs expire, so they have to be generated on demand for each request.
 * This method scans the object or array and populates the downloadUrl property.
 */
export async function filePopulateDownloadUrlInTree(objectOrArray: any) {
  if (!objectOrArray) {
    return objectOrArray;
  }

  function catchFileInTree(currentObject: any, output: Array<any>): any {
    var result = null;
    if (currentObject instanceof Array) {
      for (var i = 0; i < currentObject.length; i++) {
        result = catchFileInTree(currentObject[i], output);
      }
    } else {
      for (var prop in currentObject) {
        const hasFilename = Boolean(currentObject['filename']);
        if ((prop == 'key' || prop == 'url') && hasFilename) {
          if (currentObject[prop] != null) {
            output.push(currentObject);
            return null;
          }
        }
        if (
          currentObject[prop] instanceof Object ||
          currentObject[prop] instanceof Array
        )
          result = catchFileInTree(currentObject[prop], output);
      }
    }
    return result;
  }

  let files: Array<any> = [];
  catchFileInTree(objectOrArray, files);
  await Promise.all(files.map((file) => _filePopulateDownloadUrlOfFiles(file)));

  return objectOrArray;
}

async function _filePopulateDownloadUrlOfFiles(file: any) {
  // If file has a URL from better-upload, use it
  if (file?.url) {
    file.downloadUrl = file.url;
    return;
  }

  // If file has an S3 key, generate signed URL for private files
  if (file?.key) {
    file.downloadUrl = await generateDownloadUrl(file.key);
    return;
  }

  // Fallback: if downloadUrl already exists, keep it
  if (file?.downloadUrl) {
    return;
  }
}
