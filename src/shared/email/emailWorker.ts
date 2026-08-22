import nodemailer from 'nodemailer';
import { env } from '../../env';
import { EmailJobData } from './emailSchemas';

export async function emailWorker(data: EmailJobData) {
  const { to, bcc, subject, content, type = 'HTML' } = data;

  // Validation
  if (!to) {
    throw new Error('to is required');
  }
  if (!subject) {
    throw new Error('subject is required');
  }
  if (!content) {
    throw new Error('content is required');
  }

  const payload: {
    from: string;
    to: string;
    subject: string;
    bcc?: string | string[];
    html?: string;
    text?: string;
  } = {
    from: env.EMAIL_FROM || '',
    to,
    subject,
  };

  if (bcc) {
    payload.bcc = bcc;
  }
  if (type === 'HTML') {
    payload.html = content;
  } else {
    payload.text = content;
  }

  // Check if email is configured
  if (!env.EMAIL_SMTP_HOST || !env.EMAIL_FROM) {
    if (env.NODE_ENV !== 'test') {
      console.debug(
        `Emails are disabled. Please configure EMAIL_SMTP_HOST and EMAIL_FROM on .env`,
      );
      console.debug(payload);
    }
    return { success: true, skipped: true, reason: 'Email not configured' };
  }

  console.debug(`Processing email job: Sending email to ${to} - ${type}`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SMTP_HOST,
    port: parseInt(env.EMAIL_SMTP_PORT || '587'),
    auth: {
      user: env.EMAIL_SMTP_USER,
      pass: env.EMAIL_SMTP_PASSWORD,
    },
  });

  // Send email
  const info = await transporter.sendMail(payload);
  console.debug(`Email sent successfully: ${info.messageId}`);

  return {
    success: true,
    messageId: info.messageId,
    response: info.response,
  };
}
