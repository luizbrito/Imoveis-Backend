import { Context } from 'hono';
import { env } from '../../../env';
import { processJobs } from '../../../shared/jobs/jobProcessor';

export async function processBackgroundJobsController(c: Context) {
  if (!env.CRON_SECRET) {
    return c.json({ error: 'CRON_SECRET not configured' }, 500);
  }

  const authHeader = c.req.header('Authorization');
  const secret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (secret !== env.CRON_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const batchSize = Number(c.req.query('batchSize')) || 10;
  const result = await processJobs(batchSize);
  return c.json({ success: true, ...result });
}
