import { z } from 'zod';

export const pushTokenSaveSchema = z.object({
  type: z.enum(['web', 'mobile']),
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']).optional(),
  // Web push specific fields
  p256dh: z.string().optional(),
  auth: z.string().optional(),
  expirationTime: z.string().datetime().optional(),
});

export const pushTokenDeleteSchema = z.object({
  token: z.string().min(1),
});

export type PushTokenSave = z.output<typeof pushTokenSaveSchema>;
export type PushTokenDelete = z.output<typeof pushTokenDeleteSchema>;
