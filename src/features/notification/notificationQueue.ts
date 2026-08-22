import { env } from '../../env';
import { getPgBoss } from '../../shared/jobs/pgBoss';
import { processJobs } from '../../shared/jobs/jobProcessor';
import { NOTIFICATION_QUEUE, NotificationJobData } from './notificationSchemas';

export async function addNotificationToQueue(data: NotificationJobData) {
  const boss = await getPgBoss();
  const jobId = await boss.send(NOTIFICATION_QUEUE, data);

  if (env.BACKGROUND_JOB_MODE === 'inline') {
    await processJobs();
  }

  return { id: jobId, name: NOTIFICATION_QUEUE };
}
