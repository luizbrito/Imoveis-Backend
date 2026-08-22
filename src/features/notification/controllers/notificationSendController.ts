import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { notificationSendSchema } from '../notificationSchemas';
import { sendNotification } from '../notificationService';

export const notificationSendApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/notification/send',
  body: notificationSendSchema,
  response: 'boolean',
};

export async function notificationSendController(
  body: unknown,
  context: AppContext,
) {
  const { currentUser, currentOrganization } = await authGuardBackend(
    {
      notification: ['create'],
    },
    context,
  );

  const data = notificationSendSchema.parse(body);

  await sendNotification({
    organizationId: currentOrganization.id,
    roles: data.roles,
    payload: {
      type: 'custom',
      title: data.title,
      message: data.message,
    },
    senderUserId: currentUser.id,
    locale: context.locale,
  });

  return {
    success: true,
    message: 'Notification sent successfully',
  };
}
