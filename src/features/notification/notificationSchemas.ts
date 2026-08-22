import { z } from 'zod';
import { orderBySchema } from '../../shared/schemas/orderBySchema';
import { notificationEnumerators } from './notificationEnumerators';

export const NOTIFICATION_QUEUE = 'notification';

// Base notification schema
const baseNotificationPayloadSchema = z.object({
  type: z.enum(notificationEnumerators.type),
});

// Member added notification payload
export const memberAddedPayloadSchema = baseNotificationPayloadSchema
  .extend({
    type: z.literal('memberAdded'),
    memberName: z.string(),
    memberEmail: z.string(),
    organizationName: z.string(),
    invitedBy: z.string().optional(),
  })
  .strict();

// Member removed notification payload
export const memberRemovedPayloadSchema = baseNotificationPayloadSchema
  .extend({
    type: z.literal('memberRemoved'),
    memberName: z.string(),
    memberEmail: z.string(),
    organizationName: z.string(),
    removedBy: z.string().optional(),
  })
  .strict();

// Subscription created notification payload
export const subscriptionCreatedPayloadSchema = baseNotificationPayloadSchema
  .extend({
    type: z.literal('subscriptionCreated'),
    userName: z.string(),
    userEmail: z.string(),
    organizationName: z.string(),
    planName: z.string(),
  })
  .strict();

// Custom notification payload
export const customPayloadSchema = baseNotificationPayloadSchema
  .extend({
    type: z.literal('custom'),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
  })
  .strict();

// Discriminated union of all notification payloads
export const notificationPayloadSchema = z.discriminatedUnion('type', [
  memberAddedPayloadSchema,
  memberRemovedPayloadSchema,
  subscriptionCreatedPayloadSchema,
  customPayloadSchema,
]);

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
export type MemberAddedPayload = z.infer<typeof memberAddedPayloadSchema>;
export type MemberRemovedPayload = z.infer<typeof memberRemovedPayloadSchema>;
export type SubscriptionCreatedPayload = z.infer<
  typeof subscriptionCreatedPayloadSchema
>;
export type CustomPayload = z.infer<typeof customPayloadSchema>;

export interface NotificationJobData {
  organizationId: string;
  roles: string[];
  payload: NotificationPayload;
  senderUserId?: string;
  locale: string;
}

// API schemas for listing notifications
export const notificationFilterInputSchema = z
  .object({
    type: z.enum(notificationEnumerators.type).optional(),
    read: z.string().optional(), // 'true', 'false', or undefined for all
  })
  .strict();

export const notificationFilterSchema = z
  .object({
    type: z.enum(notificationEnumerators.type).optional(),
    read: z.boolean().optional(),
  })
  .strict();

export const notificationFindManyInputSchema = z.object({
  filter: notificationFilterInputSchema.optional(),
  orderBy: orderBySchema.optional(),
  offset: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});

export type NotificationFilterInput = z.infer<
  typeof notificationFilterInputSchema
>;
export type NotificationFilter = z.infer<typeof notificationFilterSchema>;
export type NotificationFindManyInput = z.infer<
  typeof notificationFindManyInputSchema
>;

// Mark as read schema
export const notificationMarkAsReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(), // If not provided, mark all as read
});

export type NotificationMarkAsRead = z.infer<
  typeof notificationMarkAsReadSchema
>;

// Mark as unread schema
export const notificationMarkAsUnreadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(), // If not provided, mark all as unread
});

export type NotificationMarkAsUnread = z.infer<
  typeof notificationMarkAsUnreadSchema
>;

// Send custom notification schema
export const notificationSendSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  roles: z.array(z.string()).min(1),
});

export type NotificationSend = z.infer<typeof notificationSendSchema>;
