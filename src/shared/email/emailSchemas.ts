export const EMAIL_QUEUE = 'email';

export interface EmailJobData {
  to: string;
  bcc?: string | string[] | null;
  subject: string;
  content: string;
  type?: 'HTML' | 'TEXT';
}
