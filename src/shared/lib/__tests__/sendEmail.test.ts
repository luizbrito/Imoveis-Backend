import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail } from '../sendEmail';
import * as emailQueueModule from '../../email/emailQueue';

vi.mock('../../email/emailQueue', () => ({
  addEmailToQueue: vi.fn(),
}));

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue email successfully', async () => {
    const mockJob = { id: 'job-123', name: 'email' };
    vi.mocked(emailQueueModule.addEmailToQueue).mockResolvedValue(mockJob);

    const result = await sendEmail(
      'test@example.com',
      null,
      'Test Subject',
      'Test Content',
      'HTML',
    );

    expect(emailQueueModule.addEmailToQueue).toHaveBeenCalledWith({
      to: 'test@example.com',
      bcc: undefined,
      subject: 'Test Subject',
      content: 'Test Content',
      type: 'HTML',
    });

    expect(result).toEqual({
      queued: true,
      jobId: 'job-123',
      jobName: 'email',
    });
  });

  it('should handle bcc parameter', async () => {
    const mockJob = { id: 'job-456', name: 'email' };
    vi.mocked(emailQueueModule.addEmailToQueue).mockResolvedValue(mockJob);

    await sendEmail(
      'test@example.com',
      'bcc@example.com',
      'Test Subject',
      'Test Content',
      'HTML',
    );

    expect(emailQueueModule.addEmailToQueue).toHaveBeenCalledWith({
      to: 'test@example.com',
      bcc: 'bcc@example.com',
      subject: 'Test Subject',
      content: 'Test Content',
      type: 'HTML',
    });
  });

  it('should validate required parameters', async () => {
    await expect(sendEmail('', null, 'Subject', 'Content')).rejects.toThrow(
      'to is required',
    );

    await expect(
      sendEmail('test@example.com', null, '', 'Content'),
    ).rejects.toThrow('subject is required');

    await expect(
      sendEmail('test@example.com', null, 'Subject', ''),
    ).rejects.toThrow('content is required');
  });

  it('should propagate queue errors', async () => {
    vi.mocked(emailQueueModule.addEmailToQueue).mockRejectedValue(
      new Error('Queue error'),
    );

    await expect(
      sendEmail('test@example.com', null, 'Subject', 'Content'),
    ).rejects.toThrow('Queue error');
  });
});
