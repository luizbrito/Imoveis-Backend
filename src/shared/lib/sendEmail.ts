import { addEmailToQueue } from '../email/emailQueue';

export async function sendEmail(
  to: string,
  bcc: string | string[] | null,
  subject: string,
  content: string,
  type: 'HTML' | 'TEXT' = 'HTML',
) {
  if (!to) {
    throw new Error('to is required');
  }
  if (!subject) {
    throw new Error('subject is required');
  }
  if (!content) {
    throw new Error('content is required');
  }
  if (!type) {
    throw new Error('type is required');
  }

  const job = await addEmailToQueue({
    to,
    bcc: bcc || undefined,
    subject,
    content,
    type,
  });

  console.log(`Email queued for ${to} with job ID: ${job.id}`);

  return {
    queued: true,
    jobId: job.id,
    jobName: job.name,
  };
}
