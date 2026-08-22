import { getPgBoss } from './pgBoss';
import { emailWorker } from '../email/emailWorker';
import { EMAIL_QUEUE, EmailJobData } from '../email/emailSchemas';
import { notificationWorker } from '../../features/notification/notificationWorker';
import {
  NOTIFICATION_QUEUE,
  NotificationJobData,
} from '../../features/notification/notificationSchemas';

async function processQueue<T>(
  queueName: string,
  handler: (data: T) => Promise<unknown>,
  batchSize: number,
): Promise<{ processed: number; failed: number }> {
  const boss = await getPgBoss();
  let processed = 0;
  let failed = 0;

  const jobs = await boss.fetch<T>(queueName, { batchSize });
  if (!jobs) return { processed, failed };

  for (const job of jobs) {
    try {
      await handler(job.data);
      await boss.complete(queueName, job.id);
      processed++;
      console.log(`Job ${job.id} (${queueName}) completed`);
    } catch (e) {
      const errorData = e instanceof Error ? { message: e.message } : {};
      await boss.fail(queueName, job.id, errorData);
      failed++;
      console.error(`Job ${job.id} (${queueName}) failed:`, e);
    }
  }

  return { processed, failed };
}

export async function processJobs(batchSize = 10) {
  const emailResult = await processQueue<EmailJobData>(
    EMAIL_QUEUE,
    emailWorker,
    batchSize,
  );
  const notificationResult = await processQueue<NotificationJobData>(
    NOTIFICATION_QUEUE,
    notificationWorker,
    batchSize,
  );

  return {
    processed: emailResult.processed + notificationResult.processed,
    failed: emailResult.failed + notificationResult.failed,
  };
}
