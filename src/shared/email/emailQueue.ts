import { env } from '../../env';
import { getPgBoss } from '../jobs/pgBoss';
import { processJobs } from '../jobs/jobProcessor';
import { EMAIL_QUEUE, EmailJobData } from './emailSchemas';

export async function addEmailToQueue(data: EmailJobData) {
  const boss = await getPgBoss();
  const jobId = await boss.send(EMAIL_QUEUE, data);

  if (env.BACKGROUND_JOB_MODE === 'inline') {
    await processJobs();
  }

  return { id: jobId, name: EMAIL_QUEUE };
}
