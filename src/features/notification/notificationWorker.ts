import { Prisma } from '../../prisma/generated/client';
import webpush from 'web-push';
import { env } from '../../env';
import { addEmailToQueue } from '../../shared/email/emailQueue';
import { notificationFormatContent } from './notificationFormat';
import { NotificationJobData } from './notificationSchemas';
import { prismaDangerouslyBypassRLS } from '../../prisma';
import { getDictionary } from '../../translation/getDictionary';
import { Locale } from '../../translation/locales';

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (env.EMAIL_FROM || 'noreply@example.com'),
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );
}

/**
 * Send push notification to mobile device via Expo
 * Uses Expo Access Token for authentication if available (recommended for production)
 * Without token, Expo still allows sending but with rate limits
 */
async function sendMobilePushNotification(
  token: string,
  title: string,
  body: string,
): Promise<void> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (env.EXPO_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${env.EXPO_ACCESS_TOKEN}`;
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: 'default',
      }),
    });

    const result = (await response.json()) as {
      data?: { status: string; message?: string };
    };

    if (result.data?.status === 'error') {
      console.error('Expo push notification error:', result.data);
    } else {
      console.log('Mobile push notification sent:', result);
    }
  } catch (error) {
    console.error('Failed to send mobile push notification:', error);
  }
}

/**
 * Send push notification to web browser
 */
async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  title: string,
  body: string,
): Promise<void> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title,
        body,
      }),
    );
    console.log('Web push notification sent');
  } catch (error) {
    console.error('Failed to send web push notification:', error);
  }
}

/**
 * Send email and push notifications to a single user
 */
async function sendUserNotification(
  userId: string,
  payload: NotificationJobData['payload'],
  locale: string,
  senderUserId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // If this is the sender, skip email and push (they don't need to be notified via email/push)
    if (senderUserId && userId === senderUserId) {
      console.log(
        `User ${userId} is the sender - skipping email and push notifications`,
      );
      return { success: true };
    }

    const user = await prismaDangerouslyBypassRLS.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn(`User ${userId} not found, skipping notification delivery`);
      return { success: false, error: 'User not found' };
    }

    const dictionary = await getDictionary(locale as Locale);

    const content = notificationFormatContent(payload, dictionary);

    try {
      await addEmailToQueue({
        to: user.email,
        subject: content.subject,
        content: content.body,
        type: 'HTML',
      });
      console.log(`Email notification queued for ${user.email}`);
    } catch (error) {
      console.error('Failed to queue email notification:', error);
    }

    if (env.PUSH_NOTIFICATIONS_ENABLED) {
      const pushTokens = await prismaDangerouslyBypassRLS.pushToken.findMany({
        where: { userId },
      });

      for (const pushToken of pushTokens) {
        try {
          if (pushToken.type === 'mobile' && pushToken.token) {
            await sendMobilePushNotification(
              pushToken.token,
              content.subject,
              content.pushBody,
            );
          } else if (
            pushToken.type === 'web' &&
            pushToken.token &&
            pushToken.p256dh &&
            pushToken.auth
          ) {
            await sendWebPushNotification(
              {
                endpoint: pushToken.token,
                p256dh: pushToken.p256dh,
                auth: pushToken.auth,
              },
              content.subject,
              content.pushBody,
            );
          }
        } catch (error) {
          console.error(
            `Failed to send push notification to token ${pushToken.id}:`,
            error,
          );
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Notification worker - sends email and push notifications
 * Notification records are already created by the service layer
 */
export async function notificationWorker(data: NotificationJobData) {
  const { organizationId, roles, payload, senderUserId, locale } = data;

  console.log(
    `Processing notification job: ${payload.type} for organization ${organizationId}`,
  );

  try {
    const whereClause: Prisma.MemberWhereInput = {
      organizationId,
      isNotificationsEnabled: true,
    };

    if (roles.length > 0) {
      whereClause.role = { in: roles };
    }

    const members = await prismaDangerouslyBypassRLS.member.findMany({
      where: whereClause,
      select: { userId: true },
    });

    if (members.length === 0) {
      console.debug(
        `No members found with roles [${roles.join(', ')}] in organization ${organizationId}`,
      );
      return { success: true, memberCount: 0 };
    }

    console.log(`Sending notifications to ${members.length} members`);

    const results = await Promise.allSettled(
      members.map((member) =>
        sendUserNotification(member.userId, payload, locale, senderUserId),
      ),
    );

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failureCount = results.length - successCount;

    console.log(
      `Notification job completed: ${successCount} succeeded, ${failureCount} failed`,
    );

    return {
      success: true,
      memberCount: members.length,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('Notification worker error:', error);
    throw error;
  }
}
