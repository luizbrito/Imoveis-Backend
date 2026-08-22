import { addNotificationToQueue } from './notificationQueue';
import { NotificationPayload } from './notificationSchemas';
import { prismaDangerouslyBypassRLS } from '../../prisma';
import { Prisma } from '../../prisma/generated/client';

export interface SendNotificationParams {
  organizationId: string;
  roles: string[];
  payload: NotificationPayload;
  senderUserId?: string;
  locale: string;
}

/**
 * Send notification to users in an organization based on their roles
 * This is the main interface for sending notifications throughout the application
 *
 * Creates notification records immediately, then queues email/push delivery
 *
 * @param params - Notification parameters
 * @param params.organizationId - Organization context for the notification
 * @param params.roles - Array of roles that should receive the notification (e.g., ['admin'])
 * @param params.payload - Notification payload with type and data
 * @param params.senderUserId - Optional user ID of the sender (will always receive a notification record)
 * @param params.locale - Locale for notification content (from request Accept-Language header)
 *
 * @example
 * await sendNotification({
 *   organizationId,
 *   roles: ['admin'],
 *   payload: {
 *     type: 'memberAdded',
 *     memberName: 'John Doe',
 *     memberEmail: 'john@example.com',
 *     invitedBy: 'Jane Smith',
 *   },
 *   senderUserId: currentUser.id,
 *   locale: dictionaryLocaleFromRequest(context.request),
 * });
 */
export async function sendNotification(
  params: SendNotificationParams,
): Promise<void> {
  try {
    const organization =
      await prismaDangerouslyBypassRLS.organization.findUnique({
        where: { id: params.organizationId },
        select: { id: true, name: true },
      });

    if (!organization) {
      console.error(`Organization ${params.organizationId} not found`);
      return;
    }

    let enrichedPayload = params.payload;
    if (
      params.payload.type === 'memberAdded' ||
      params.payload.type === 'memberRemoved' ||
      params.payload.type === 'subscriptionCreated'
    ) {
      enrichedPayload = {
        ...params.payload,
        organizationName: organization.name,
      } as NotificationPayload;
    }

    const whereClause: Prisma.MemberWhereInput = {
      organizationId: params.organizationId,
      isNotificationsEnabled: true,
    };

    if (params.roles.length > 0) {
      whereClause.role = { in: params.roles };
    }

    const members = await prismaDangerouslyBypassRLS.member.findMany({
      where: whereClause,
      select: { userId: true },
    });

    const userIdsToNotify = new Set<string>();

    if (params.senderUserId) {
      userIdsToNotify.add(params.senderUserId);
    }

    members.forEach((member) => userIdsToNotify.add(member.userId));

    if (userIdsToNotify.size === 0) {
      console.debug(
        `No users to notify in organization ${params.organizationId}`,
      );
      return;
    }

    const notifications = await Promise.all(
      Array.from(userIdsToNotify).map((userId) =>
        prismaDangerouslyBypassRLS.notification.create({
          data: {
            userId,
            organizationId: params.organizationId,
            type: params.payload.type,
            roles: params.roles,
            payload: enrichedPayload as any,
          },
        }),
      ),
    );

    console.log(
      `Created ${notifications.length} notification records for organization ${params.organizationId}`,
    );

    await addNotificationToQueue({
      organizationId: params.organizationId,
      roles: params.roles,
      payload: enrichedPayload,
      senderUserId: params.senderUserId,
      locale: params.locale,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
