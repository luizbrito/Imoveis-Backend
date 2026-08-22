import { getPgBoss, stopPgBoss } from './shared/jobs/pgBoss';
import { emailWorker } from './shared/email/emailWorker';
import { EMAIL_QUEUE, type EmailJobData } from './shared/email/emailSchemas';
import { notificationWorker } from './features/notification/notificationWorker';
import {
  NOTIFICATION_QUEUE,
  type NotificationJobData,
} from './features/notification/notificationSchemas';
import type { Job } from 'pg-boss';

async function startWorkers() {
  console.log('Starting background workers...');
  // getPgBoss() creates all queues on initialization
  const boss = await getPgBoss();

  // Process one job at a time for simpler error handling
  await boss.work<EmailJobData>(
    EMAIL_QUEUE,
    async ([job]: Job<EmailJobData>[]) => {
      await emailWorker(job.data);
    },
  );

  await boss.work<NotificationJobData>(
    NOTIFICATION_QUEUE,
    async ([job]: Job<NotificationJobData>[]) => {
      await notificationWorker(job.data);
    },
  );

  console.log('Workers started successfully');

  const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received, closing workers...`);
    await stopPgBoss();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  if (process.platform === 'win32') {
    process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
  }
}

startWorkers().catch((error) => {
  console.error('Failed to start workers:', error);
});
